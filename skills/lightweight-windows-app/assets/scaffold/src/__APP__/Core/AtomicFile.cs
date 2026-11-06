using System;
using System.IO;
using System.Text;

namespace __APP__.Core;

public static class AtomicFile
{
    /// <summary>Writes a temp file through to disk and swaps it in, keeping the old content as .bak, so a crash never leaves a truncated file.</summary>
    public static void WriteAllText(string path, string text)
    {
        var bytes = new UTF8Encoding(false).GetBytes(text);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        var temp = path + ".tmp";
        using (var stream = new FileStream(temp, FileMode.Create, FileAccess.Write, FileShare.None, 4096, FileOptions.WriteThrough)) stream.Write(bytes, 0, bytes.Length);
        if (File.Exists(path)) File.Replace(temp, path, path + ".bak", ignoreMetadataErrors: true);
        else File.Move(temp, path);
    }

    /// <summary>The text of the file, else of its .bak, else null. An empty or unreadable file does not count.</summary>
    public static string? ReadAllText(string path)
    {
        foreach (var candidate in new[] { path, path + ".bak" })
        {
            try
            {
                var text = File.Exists(candidate) ? File.ReadAllText(candidate, Encoding.UTF8) : null;
                if (!string.IsNullOrWhiteSpace(text)) return text;
            }
            catch (Exception exception) when (exception is IOException || exception is UnauthorizedAccessException)
            {
                // The next candidate may still be readable.
            }
        }
        return null;
    }
}
