using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

namespace __APP__.Ui;

/// <summary>A switch whose knob travels on a real toggle. The initial state shows no motion, and motion follows the live system setting.</summary>
/// <remarks>Not an EventTrigger in the template: Checked fires when a constructor sets IsChecked, before the template's names exist, and the storyboard throws.</remarks>
public sealed class Switch : CheckBox
{
    protected override void OnChecked(RoutedEventArgs e) { base.OnChecked(e); Travel("Size.SwitchTravelBack"); }

    protected override void OnUnchecked(RoutedEventArgs e) { base.OnUnchecked(e); Travel("Size.SwitchTravel"); }

    private void Travel(string fromToken)
    {
        if (!IsLoaded || !SystemParameters.ClientAreaAnimation || !(Template.FindName("Knob", this) is Shape knob)) return;
        var travel = new TranslateTransform();
        knob.RenderTransform = travel;
        travel.BeginAnimation(TranslateTransform.XProperty, new DoubleAnimation(Artwork.Token<double>(fromToken), 0, Artwork.Token<Duration>("Motion.Fast")) { EasingFunction = Artwork.Token<IEasingFunction>("Motion.Ease") });
    }
}
