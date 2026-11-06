using System;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;
using __APP__.Native;

namespace __APP__.Ui;

/// <summary>The notification-area menu, drawn with the app's own components.</summary>
public partial class TrayMenuWindow : Window
{
    private bool _closing;

    internal TrayMenuWindow()
    {
        InitializeComponent();
        Deactivated += (s, e) => CloseOnce();
        KeyDown += (s, e) => { if (e.Key == Key.Escape) CloseOnce(); };
        Closing += (s, e) => _closing = true;
    }

    internal void ShowAt(NativeMethods.Point cursor)
    {
        var handle = PlaceAt(cursor);
        Show();
        Activate();
        NativeMethods.SetForegroundWindow(handle);
    }

    /// <summary>Puts the menu's corner at the cursor, inside that monitor's work area, in physical pixels and before it is ever visible.</summary>
    internal IntPtr PlaceAt(NativeMethods.Point cursor)
    {
        var handle = new WindowInteropHelper(this).EnsureHandle();
        // Measure the content: until Show, SizeToContent has not touched the HWND, which still has a default size.
        var root = (FrameworkElement)Content;
        root.Measure(new Size(double.PositiveInfinity, double.PositiveInfinity));
        var work = NativeMethods.WorkAreaAt(cursor, out var scale);
        var width = (int)Math.Ceiling(root.DesiredSize.Width * scale);
        var height = (int)Math.Ceiling(root.DesiredSize.Height * scale);
        var x = Math.Max(work.Left, Math.Min(cursor.X - width + (int)(root.Margin.Right * scale), work.Right - width));
        var y = Math.Max(work.Top, Math.Min(cursor.Y - height + (int)(root.Margin.Bottom * scale), work.Bottom - height));
        // Two passes: arriving on a monitor with another DPI can move the window.
        for (var pass = 0; pass < 2; pass++) NativeMethods.SetWindowPos(handle, IntPtr.Zero, x, y, width, height, NativeMethods.SwpPlace);
        return handle;
    }

    private void OnSettingsClicked(object sender, RoutedEventArgs e) { CloseOnce(); ((App)Application.Current).OpenSettings(); }

    private void OnQuitClicked(object sender, RoutedEventArgs e) => Application.Current.Shutdown();

    private void CloseOnce()
    {
        if (_closing) return;
        _closing = true;
        Close();
    }
}
