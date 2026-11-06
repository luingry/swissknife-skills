using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime;
using System.Threading;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Threading;
using __APP__.Core;
using __APP__.Native;
using __APP__.Shell;
using __APP__.Ui;

namespace __APP__;

public partial class App : Application
{
    private const string HostTitle = "__APP__.Host";
    private const int ShowSettingsMessage = NativeMethods.WmApp + 2;
    private const long MaxLogBytes = 1024 * 1024;

    private Mutex? _instance;
    private HwndSource? _host;
    private int _taskbarCreated;
    private TrayIcon? _tray;
    private SettingsWindow? _settingsWindow;
    private TrayMenuWindow? _menu;
    private bool _persist;

    internal AppSettings Settings { get; private set; } = new AppSettings();
    internal static string Version => Assembly.GetExecutingAssembly().GetName().Version!.ToString(3);
    private static string DataFolder => Path.Combine(UserFolders.Roaming, "__APP__");
    private static string SettingsPath => Path.Combine(DataFolder, "settings.ini");

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        DispatcherUnhandledException += OnUnhandled;
        AppDomain.CurrentDomain.UnhandledException += (s, args) => WriteCrashLog((Exception)args.ExceptionObject);
        // A small layered window gains nothing from a GPU device, which costs tens of MB.
        RenderOptions.ProcessRenderMode = RenderMode.SoftwareOnly;

        // Diagnostics run before the mutex and the settings, so they cannot persist anything.
        if (e.Args.Length >= 2 && (e.Args[0] == "--export-icon" || e.Args[0] == "--snapshot"))
        {
            if (e.Args[0] == "--export-icon") Artwork.WriteIconFile(e.Args[1]);
            else Snapshot.Write(e.Args[1]);
            Shutdown();
            return;
        }

        _instance = new Mutex(true, @"Local\__APP__.SingleInstance", out var firstInstance);
        if (!firstInstance)
        {
            // Launching again is the way back to the settings.
            var running = NativeMethods.FindWindow(null, HostTitle);
            NativeMethods.AllowSetForegroundWindow(NativeMethods.AsfwAny);
            if (running != IntPtr.Zero) NativeMethods.PostMessage(running, ShowSettingsMessage, IntPtr.Zero, IntPtr.Zero);
            _instance.Dispose();
            _instance = null;
            Shutdown();
            return;
        }

        _persist = true;
        StartProfile();
        Settings = AppSettings.Load(SettingsPath);
        _taskbarCreated = NativeMethods.RegisterWindowMessage("TaskbarCreated");
        _host = new HwndSource(new HwndSourceParameters(HostTitle) { WindowStyle = NativeMethods.WsPopup, ExtendedWindowStyle = NativeMethods.WsExToolWindow, Width = 0, Height = 0 });
        _host.AddHook(HostProc);
        _tray = new TrayIcon(_host.Handle);
        _tray.Show(Artwork.CreateAppIconHandle(), "__APP__");
        if (e.Args.Contains(StartupRegistration.StartupArgument)) ReleaseMemory();
        else OpenSettings();
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _tray?.Dispose();
        _host?.Dispose();
        SaveSettings(); // Before the mutex: a new instance must find the final state.
        _instance?.ReleaseMutex();
        _instance?.Dispose();
        base.OnExit(e);
    }

    internal void OpenSettings()
    {
        _menu?.Close();
        if (_settingsWindow == null)
        {
            _settingsWindow = new SettingsWindow();
            _settingsWindow.Closed += (s, e) => { _settingsWindow = null; ReleaseMemory(); };
            _settingsWindow.Show();
        }
        _settingsWindow.Activate();
        NativeMethods.SetForegroundWindow(new WindowInteropHelper(_settingsWindow).Handle);
    }

    internal void SaveSettings()
    {
        if (_persist) Guarded(() => Settings.Save(SettingsPath), WriteCrashLog);
    }

    private IntPtr HostProc(IntPtr window, int message, IntPtr wParam, IntPtr lParam, ref bool handled)
    {
        if (message == _taskbarCreated) _tray?.Restore();
        else if (message == NativeMethods.WmClose) Shutdown(); // The installer asks the running app to leave before replacing it.
        else if (message == ShowSettingsMessage) OpenSettings();
        else if (message == TrayIcon.CallbackMessage)
        {
            var trayEvent = lParam.ToInt64() & 0xFFFF;
            if (trayEvent == NativeMethods.NinSelect || trayEvent == NativeMethods.NinKeySelect) OpenSettings();
            else if (trayEvent == NativeMethods.WmContextMenu) ShowTrayMenu();
        }
        else return IntPtr.Zero;
        handled = true;
        return IntPtr.Zero;
    }

    private void ShowTrayMenu()
    {
        _menu?.Close();
        NativeMethods.GetCursorPos(out var cursor);
        _menu = new TrayMenuWindow();
        _menu.Closed += (s, e) => { _menu = null; ReleaseMemory(); };
        _menu.ShowAt(cursor);
    }

    /// <summary>A resident app should not sit on what a closed screen used.</summary>
    private void ReleaseMemory() => Dispatcher.BeginInvoke(new Action(() =>
    {
        GC.Collect();
        GC.WaitForPendingFinalizers();
        NativeMethods.SetProcessWorkingSetSize(NativeMethods.GetCurrentProcess(), new IntPtr(-1), new IntPtr(-1));
    }), DispatcherPriority.ApplicationIdle);

    private static void StartProfile() => Guarded(() =>
    {
        var folder = Path.Combine(UserFolders.Local, "__APP__");
        Directory.CreateDirectory(folder);
        ProfileOptimization.SetProfileRoot(folder);
        ProfileOptimization.StartProfile("startup.profile");
    });

    private void OnUnhandled(object sender, DispatcherUnhandledExceptionEventArgs e)
    {
        WriteCrashLog(e.Exception);
        e.Handled = _tray != null; // A resident app outlives one failed action; a failed startup must crash, not hold the mutex with no tray.
        if (_persist) return;
        // A diagnostic fails fast: no dialog, nothing written, and a non-zero exit code.
        Console.Error.WriteLine(e.Exception);
        Environment.Exit(1);
    }

    private void WriteCrashLog(Exception exception)
    {
        if (!_persist) return;
        Guarded(() =>
        {
            Directory.CreateDirectory(DataFolder);
            var log = new FileInfo(Path.Combine(DataFolder, "crash.log"));
            if (log.Exists && log.Length > MaxLogBytes) log.Delete();
            File.AppendAllText(log.FullName, DateTime.Now.ToString("s") + " " + exception + Environment.NewLine);
        });
    }

    /// <summary>Disk trouble must never take a tray app down.</summary>
    private static void Guarded(Action action, Action<Exception>? onFailure = null)
    {
        try
        {
            action();
        }
        catch (Exception exception) when (exception is IOException || exception is UnauthorizedAccessException)
        {
            onFailure?.Invoke(exception);
        }
    }
}
