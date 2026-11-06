using System;
using System.Globalization;

namespace __APP__.Core;

/// <summary>User preferences, stored as a small key=value file. Unknown keys and bad values are ignored.</summary>
public sealed class AppSettings
{
    public const int MinExample = 0, MaxExample = 100;
    private int _examplePercent = 50;

    /// <summary>Shows the pattern; replace it with the product's first real preference.</summary>
    public int ExamplePercent
    {
        get => _examplePercent;
        set => _examplePercent = Math.Max(MinExample, Math.Min(MaxExample, value));
    }

    public static AppSettings Parse(string text)
    {
        var settings = new AppSettings();
        foreach (var line in text.Split('\r', '\n'))
        {
            var separator = line.IndexOf('=');
            if (separator <= 0) continue;
            var value = line.Substring(separator + 1).Trim();
            switch (line.Substring(0, separator).Trim())
            {
                case "example" when int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var example):
                    settings.ExamplePercent = example;
                    break;
            }
        }
        return settings;
    }

    public string Serialize() => "example=" + ExamplePercent.ToString(CultureInfo.InvariantCulture) + Environment.NewLine;

    public static AppSettings Load(string path) => AtomicFile.ReadAllText(path) is string text ? Parse(text) : new AppSettings();

    public void Save(string path) => AtomicFile.WriteAllText(path, Serialize());
}
