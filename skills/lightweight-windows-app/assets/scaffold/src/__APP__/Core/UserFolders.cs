using System;
using System.IO;

namespace __APP__.Core;

/// <summary>Per-user folders that are never empty. At sign-in a Run-key process can start before the shell verifies the profile; the default GetFolderPath then returns "" and every path silently becomes relative.</summary>
public static class UserFolders
{
    public static string Roaming => Resolve(Environment.SpecialFolder.ApplicationData, "APPDATA", @"AppData\Roaming");
    public static string Local => Resolve(Environment.SpecialFolder.LocalApplicationData, "LOCALAPPDATA", @"AppData\Local");

    public static string Resolve(Environment.SpecialFolder folder, string variable, string profileRelative,
        Func<Environment.SpecialFolder, string>? special = null, Func<string, string?>? environment = null)
    {
        special ??= value => Environment.GetFolderPath(value, Environment.SpecialFolderOption.DoNotVerify);
        environment ??= Environment.GetEnvironmentVariable;
        var path = special(folder);
        if (IsUsable(path)) return path;
        path = environment(variable) ?? "";
        if (IsUsable(path)) return path;
        path = special(Environment.SpecialFolder.UserProfile);
        if (!IsUsable(path)) path = environment("USERPROFILE") ?? "";
        if (!IsUsable(path)) throw new InvalidOperationException("The user profile folder is unavailable.");
        return Path.Combine(path, profileRelative);
    }

    private static bool IsUsable(string path) => !string.IsNullOrWhiteSpace(path) && Path.IsPathRooted(path);
}
