using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using __APP__.Native;

namespace __APP__.Ui;

/// <summary>The app's drawn mark, on every surface that carries it.</summary>
internal static class Artwork
{
    private static readonly int[] IconSizes = { 16, 20, 24, 32, 40, 48, 64, 128, 256 };

    /// <summary>PLACEHOLDER mark: replace this drawing with the product's own.</summary>
    public static void DrawAppIcon(DrawingContext dc, double size)
    {
        dc.DrawRoundedRectangle(Token<Brush>("Brush.Accent"), null, new Rect(0, 0, size, size), size / 4, size / 4);
        dc.DrawEllipse(Token<Brush>("Brush.Surface"), null, new Point(size / 2, size / 2), size / 4, size / 4);
    }

    /// <summary>C# reads tokens only through here, so literal values never reach code.</summary>
    public static T Token<T>(string key) => (T)Application.Current.FindResource(key);

    public static DrawingImage AppIconImage()
    {
        var group = new DrawingGroup();
        using (var dc = group.Open()) DrawAppIcon(dc, IconSizes[IconSizes.Length - 1]);
        var image = new DrawingImage(group);
        image.Freeze();
        return image;
    }

    public static BitmapSource Render(int width, int height, Action<DrawingContext> draw)
    {
        var visual = new DrawingVisual();
        using (var dc = visual.RenderOpen()) draw(dc);
        var bitmap = new RenderTargetBitmap(width, height, 96, 96, PixelFormats.Pbgra32);
        bitmap.Render(visual);
        bitmap.Freeze();
        return bitmap;
    }

    /// <summary>An HICON at the small-icon size for this DPI. The caller owns it; TrayIcon destroys it.</summary>
    public static IntPtr CreateAppIconHandle()
    {
        var size = NativeMethods.GetSystemMetricsForDpi(NativeMethods.SmCxSmIcon, NativeMethods.GetDpiForSystem());
        var pixels = new byte[size * size * 4];
        new FormatConvertedBitmap(Render(size, size, dc => DrawAppIcon(dc, size)), PixelFormats.Bgra32, null, 0).CopyPixels(pixels, size * 4, 0);
        var color = NativeMethods.CreateBitmap(size, size, 1, 32, pixels);
        var mask = NativeMethods.CreateBitmap(size, size, 1, 1, null);
        try
        {
            var info = new NativeMethods.IconInfo { IsIcon = true, Color = color, Mask = mask };
            var handle = NativeMethods.CreateIconIndirect(ref info);
            return handle != IntPtr.Zero ? handle : throw new ExternalException("CreateIconIndirect failed", Marshal.GetLastWin32Error());
        }
        finally
        {
            NativeMethods.DeleteObject(color);
            NativeMethods.DeleteObject(mask);
        }
    }

    /// <summary>--export-icon: an .ico with PNG frames, a 256 px .png beside it for the README, and the installer's wizard art.</summary>
    public static void WriteIconFile(string path)
    {
        var art = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(path))!, "installer");
        Directory.CreateDirectory(art);
        foreach (var (name, width, height) in new[] { ("wizard", 164, 314), ("wizard", 328, 628), ("wizard-small", 55, 58), ("wizard-small", 110, 116) })
            WriteWizardArt(Path.Combine(art, $"{name}-{width}x{height}.bmp"), width, height);

        var frames = new byte[IconSizes.Length][];
        for (var i = 0; i < IconSizes.Length; i++) frames[i] = EncodePng(IconSizes[i]);
        File.WriteAllBytes(Path.ChangeExtension(path, ".png"), frames[frames.Length - 1]);

        using var writer = new BinaryWriter(File.Create(path));
        foreach (var header in new[] { 0, 1, frames.Length }) writer.Write((ushort)header);
        var offset = 6 + 16 * frames.Length;
        for (var i = 0; i < frames.Length; i++)
        {
            var size = (byte)(IconSizes[i] >= 256 ? 0 : IconSizes[i]);
            writer.Write(size);
            writer.Write(size);
            foreach (var field in new[] { 0, 1, 32 }) writer.Write((ushort)field);
            writer.Write(frames[i].Length);
            writer.Write(offset);
            offset += frames[i].Length;
        }
        foreach (var frame in frames) writer.Write(frame);
    }

    /// <summary>A 24-bit BMP for Inno Setup: the mark centered on the surface color.</summary>
    private static void WriteWizardArt(string path, int width, int height)
    {
        var size = Math.Min(width, height) * 3 / 5;
        var art = Render(width, height, dc =>
        {
            dc.DrawRectangle(Token<Brush>("Brush.Surface"), null, new Rect(0, 0, width, height));
            dc.PushTransform(new TranslateTransform((width - size) / 2.0, (height - size) / 2.0));
            DrawAppIcon(dc, size);
            dc.Pop();
        });
        var encoder = new BmpBitmapEncoder();
        encoder.Frames.Add(BitmapFrame.Create(new FormatConvertedBitmap(art, PixelFormats.Bgr24, null, 0)));
        using var stream = File.Create(path);
        encoder.Save(stream);
    }

    private static byte[] EncodePng(int size)
    {
        var encoder = new PngBitmapEncoder();
        encoder.Frames.Add(BitmapFrame.Create(Render(size, size, dc => DrawAppIcon(dc, size))));
        using var stream = new MemoryStream();
        encoder.Save(stream);
        return stream.ToArray();
    }
}
