using System;
using System.IO;
using __APP__.Core;

namespace __APP__.Tests;

internal static class Program
{
    private static int _failures;

    private static int Main()
    {
        var folder = Path.Combine(Path.GetTempPath(), "__APP_LOWER__-tests-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(folder);
        try
        {
            AtomicWriteKeepsTheOldVersion(Path.Combine(folder, "nested", "file.txt"));
            ReadFallsBackToTheBackup(Path.Combine(folder, "fallback.txt"));
            SettingsClampAndIgnoreJunk(Path.Combine(folder, "absent.ini"));
            SettingsRoundTrip(Path.Combine(folder, "settings.ini"));
            FoldersAreNeverEmpty();
        }
        finally
        {
            Directory.Delete(folder, true);
        }
        Console.WriteLine(_failures == 0 ? "OK" : _failures + " failure(s)");
        return _failures == 0 ? 0 : 1;
    }

    private static void AtomicWriteKeepsTheOldVersion(string path)
    {
        AtomicFile.WriteAllText(path, "primeira versão");
        Check(File.ReadAllText(path) == "primeira versão", "writes UTF-8 text");
        Check(File.ReadAllBytes(path)[0] != 0xEF, "writes no BOM");
        Check(!File.Exists(path + ".bak"), "the first write has nothing to back up");
        AtomicFile.WriteAllText(path, "second");
        Check(File.ReadAllText(path) == "second", "replaces the content");
        Check(File.ReadAllText(path + ".bak") == "primeira versão", "keeps the old content as .bak");
        Check(!File.Exists(path + ".tmp"), "leaves no temp file");
    }

    private static void ReadFallsBackToTheBackup(string path)
    {
        Check(AtomicFile.ReadAllText(path) == null, "nothing to read is null");
        AtomicFile.WriteAllText(path, "good");
        AtomicFile.WriteAllText(path, "newer");
        File.WriteAllText(path, "");
        Check(AtomicFile.ReadAllText(path) == "good", "an empty file falls back to .bak");
    }

    private static void SettingsClampAndIgnoreJunk(string absent)
    {
        Check(new AppSettings().ExamplePercent == 50, "default");
        Check(AppSettings.Parse("example=500").ExamplePercent == AppSettings.MaxExample, "clamps high");
        Check(AppSettings.Parse("example=-3").ExamplePercent == AppSettings.MinExample, "clamps low");
        Check(AppSettings.Parse("junk\r\nexample=abc\nother=1\n=2").ExamplePercent == 50, "ignores bad lines and unknown keys");
        Check(AppSettings.Load(absent).ExamplePercent == 50, "a missing file gives defaults");
    }

    private static void SettingsRoundTrip(string path)
    {
        new AppSettings { ExamplePercent = 72 }.Save(path);
        Check(AppSettings.Load(path).ExamplePercent == 72, "saves and loads through the file");
    }

    private static void FoldersAreNeverEmpty()
    {
        const Environment.SpecialFolder Folder = Environment.SpecialFolder.ApplicationData;
        Check(UserFolders.Resolve(Folder, "V", "rel", f => @"C:\special", v => null) == @"C:\special", "uses the special folder");
        Check(UserFolders.Resolve(Folder, "V", "rel", f => "", v => v == "V" ? @"C:\env" : null) == @"C:\env", "falls back to the variable");
        Check(UserFolders.Resolve(Folder, "V", "rel", f => "", v => v == "USERPROFILE" ? @"C:\home" : null) == @"C:\home\rel", "falls back to the profile");
    }

    private static void Check(bool condition, string name)
    {
        if (condition) return;
        _failures++;
        Console.WriteLine("FAILED: " + name);
    }
}
