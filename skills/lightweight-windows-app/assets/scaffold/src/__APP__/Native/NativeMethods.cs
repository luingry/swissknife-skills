using System;
using System.Runtime.InteropServices;

namespace __APP__.Native;

internal static class NativeMethods
{
    public const int WmClose = 0x0010, WmContextMenu = 0x007B, WmApp = 0x8000, NinSelect = 0x0400, NinKeySelect = 0x0401;
    public const int WsExToolWindow = 0x00000080, WsPopup = unchecked((int)0x80000000);
    public const int SmCxSmIcon = 49, AsfwAny = -1, MdtEffectiveDpi = 0;
    public const uint SwpPlace = 0x0004 | 0x0010; // SWP_NOZORDER | SWP_NOACTIVATE
    public const uint SwpMoveOnly = SwpPlace | 0x0001; // SWP_NOSIZE
    public const uint MonitorDefaultToNearest = 2, NimAdd = 0, NimModify = 1, NimDelete = 2, NimSetVersion = 4;
    public const uint NifMessage = 0x01, NifIcon = 0x02, NifTip = 0x04, NotifyIconVersion4 = 4;
    public const double BaseDpi = 96;

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct NotifyIconData
    {
        public int Size;
        public IntPtr Window;
        public uint Id, Flags;
        public int CallbackMessage;
        public IntPtr Icon;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)] public string Tip;
        public uint State, StateMask;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)] public string Info;
        public uint Version;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 64)] public string InfoTitle;
        public uint InfoFlags;
        public Guid Item;
        public IntPtr BalloonIcon;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct IconInfo
    {
        [MarshalAs(UnmanagedType.Bool)] public bool IsIcon;
        public int HotspotX, HotspotY;
        public IntPtr Mask, Color;
    }

    [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left, Top, Right, Bottom; }
    [StructLayout(LayoutKind.Sequential)] public struct Point { public int X, Y; }
    [StructLayout(LayoutKind.Sequential)] public struct MonitorInfo { public int Size; public Rect Frame, Work; public uint Flags; }

    [DllImport("kernel32.dll")] public static extern IntPtr GetCurrentProcess();
    [DllImport("kernel32.dll")] public static extern bool SetProcessWorkingSetSize(IntPtr process, IntPtr minimum, IntPtr maximum);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int RegisterWindowMessage(string name);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern IntPtr FindWindow(string? className, string windowName);
    [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr window, int message, IntPtr wParam, IntPtr lParam);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr window);
    [DllImport("user32.dll")] public static extern bool AllowSetForegroundWindow(int processId);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr window, IntPtr after, int x, int y, int width, int height, uint flags);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr window, out Rect rect);
    [DllImport("user32.dll")] public static extern bool GetCursorPos(out Point point);
    [DllImport("user32.dll")] public static extern IntPtr MonitorFromPoint(Point point, uint flags);
    [DllImport("user32.dll", EntryPoint = "GetMonitorInfoW")] public static extern bool GetMonitorInfo(IntPtr monitor, ref MonitorInfo info);
    [DllImport("user32.dll")] public static extern int GetSystemMetricsForDpi(int index, uint dpi);
    [DllImport("user32.dll")] public static extern uint GetDpiForSystem();
    [DllImport("shcore.dll")] public static extern int GetDpiForMonitor(IntPtr monitor, int type, out uint dpiX, out uint dpiY);
    [DllImport("user32.dll", SetLastError = true)] public static extern IntPtr CreateIconIndirect(ref IconInfo info);
    [DllImport("user32.dll")] public static extern bool DestroyIcon(IntPtr icon);
    [DllImport("gdi32.dll")] public static extern IntPtr CreateBitmap(int width, int height, uint planes, uint bitsPerPixel, byte[]? bits);
    [DllImport("gdi32.dll")] public static extern bool DeleteObject(IntPtr handle);
    [DllImport("shell32.dll", CharSet = CharSet.Unicode, EntryPoint = "Shell_NotifyIconW")] public static extern bool ShellNotifyIcon(uint message, ref NotifyIconData data);

    /// <summary>The work area of the monitor nearest the point, in physical pixels, and that monitor's scale.</summary>
    public static Rect WorkAreaAt(Point point, out double scale)
    {
        var monitor = MonitorFromPoint(point, MonitorDefaultToNearest);
        var info = new MonitorInfo { Size = Marshal.SizeOf<MonitorInfo>() };
        GetMonitorInfo(monitor, ref info);
        GetDpiForMonitor(monitor, MdtEffectiveDpi, out var dpi, out _);
        scale = dpi / BaseDpi;
        return info.Work;
    }
}
