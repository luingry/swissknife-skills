using System;
using System.IO;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace __APP__.Ui;

/// <summary>--snapshot: renders every visual state to PNG off-screen. Add each new state here.</summary>
internal static class Snapshot
{
    public static void Write(string directory)
    {
        Directory.CreateDirectory(directory);
        Capture(directory, "settings-off.png", new SettingsWindow(preview: false));
        Capture(directory, "settings-on.png", new SettingsWindow(preview: true));
        Capture(directory, "tray-menu.png", new TrayMenuWindow());
    }

    private static void Capture(string directory, string name, Window window)
    {
        window.ShowActivated = false;
        window.ShowInTaskbar = false;
        window.WindowStartupLocation = WindowStartupLocation.Manual;
        window.Left = window.Top = -10000;
        window.Show();
        window.UpdateLayout();
        var (width, height) = ((int)Math.Ceiling(window.ActualWidth), (int)Math.Ceiling(window.ActualHeight));
        var content = new RenderTargetBitmap(width, height, 96, 96, PixelFormats.Pbgra32);
        content.Render((Visual)window.Content);
        window.Close();

        var encoder = new PngBitmapEncoder();
        encoder.Frames.Add(BitmapFrame.Create(Artwork.Render(width, height, dc =>
        {
            dc.DrawRectangle(Artwork.Token<Brush>("Brush.Backdrop"), null, new Rect(0, 0, width, height));
            dc.DrawImage(content, new Rect(0, 0, width, height));
        })));
        using var stream = File.Create(Path.Combine(directory, name));
        encoder.Save(stream);
    }
}
