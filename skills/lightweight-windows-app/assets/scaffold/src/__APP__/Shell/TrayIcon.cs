using System;
using System.Runtime.InteropServices;
using __APP__.Native;

namespace __APP__.Shell;

/// <summary>The notification-area icon, on raw Shell_NotifyIcon version 4.</summary>
internal sealed class TrayIcon : IDisposable
{
    public const int CallbackMessage = NativeMethods.WmApp + 1;
    private readonly IntPtr _window;
    private IntPtr _icon;
    private string _tip = "";
    private bool _added;

    public TrayIcon(IntPtr window) => _window = window;

    /// <summary>Shows or updates the icon, taking ownership of the handle.</summary>
    public void Show(IntPtr ownedIcon, string tip)
    {
        var previous = _icon;
        _icon = ownedIcon;
        _tip = tip;
        var data = CreateData();
        if (_added) NativeMethods.ShellNotifyIcon(NativeMethods.NimModify, ref data);
        else Add();
        if (previous != IntPtr.Zero) NativeMethods.DestroyIcon(previous);
    }

    /// <summary>TaskbarCreated: Explorer restarted and forgot the icon, or the shell was not up yet at sign-in.</summary>
    public void Restore()
    {
        if (_icon != IntPtr.Zero) Add();
    }

    public void Dispose()
    {
        var data = CreateData();
        NativeMethods.ShellNotifyIcon(NativeMethods.NimDelete, ref data);
        if (_icon != IntPtr.Zero) NativeMethods.DestroyIcon(_icon);
        _icon = IntPtr.Zero;
    }

    private void Add()
    {
        var data = CreateData();
        _added = NativeMethods.ShellNotifyIcon(NativeMethods.NimAdd, ref data);
        data.Version = NativeMethods.NotifyIconVersion4;
        if (_added) NativeMethods.ShellNotifyIcon(NativeMethods.NimSetVersion, ref data);
    }

    // Version 4 hides the native tooltip without NIF_SHOWTIP; the tip remains for screen readers.
    private NativeMethods.NotifyIconData CreateData() => new NativeMethods.NotifyIconData
    {
        Size = Marshal.SizeOf<NativeMethods.NotifyIconData>(),
        Window = _window,
        Id = 1,
        Flags = NativeMethods.NifMessage | NativeMethods.NifIcon | NativeMethods.NifTip,
        CallbackMessage = CallbackMessage,
        Icon = _icon,
        Tip = _tip,
    };
}
