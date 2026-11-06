using System;
using System.Windows;
using System.Windows.Interop;
using __APP__.Native;
using __APP__.Shell;

namespace __APP__.Ui;

public partial class SettingsWindow : Window
{
    private NativeMethods.Point _grabCursor;
    private NativeMethods.Rect _grabWindow;

    /// <param name="preview">Snapshots pass the switch state: the registry is then neither read nor written.</param>
    internal SettingsWindow(bool? preview = null)
    {
        InitializeComponent();
        AppIcon.Source = Artwork.AppIconImage();
        Icon = Artwork.Render(32, 32, dc => Artwork.DrawAppIcon(dc, 32));
        VersionText.Text = "v" + App.Version;
        StartupToggle.IsChecked = preview ?? StartupRegistration.IsEnabled;
        if (preview == null) StartupToggle.Checked += OnStartupChanged;
        if (preview == null) StartupToggle.Unchecked += OnStartupChanged;

        // DragMove enters a modal loop that swallows clicks; physical pixels stay right across monitors.
        MouseLeftButtonDown += (s, e) =>
        {
            NativeMethods.GetCursorPos(out _grabCursor);
            NativeMethods.GetWindowRect(new WindowInteropHelper(this).Handle, out _grabWindow);
            CaptureMouse();
        };
        MouseMove += (s, e) =>
        {
            if (!IsMouseCaptured) return;
            NativeMethods.GetCursorPos(out var cursor);
            NativeMethods.SetWindowPos(new WindowInteropHelper(this).Handle, IntPtr.Zero, _grabWindow.Left + cursor.X - _grabCursor.X, _grabWindow.Top + cursor.Y - _grabCursor.Y, 0, 0, NativeMethods.SwpMoveOnly);
        };
        MouseLeftButtonUp += (s, e) => ReleaseMouseCapture();
    }

    private void OnStartupChanged(object sender, RoutedEventArgs e) => StartupRegistration.Set(StartupToggle.IsChecked == true);

    private void OnCloseClicked(object sender, RoutedEventArgs e) => Close();
}
