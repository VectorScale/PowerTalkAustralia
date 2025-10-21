This is the PTComponents folder, which stores the reusable assets designed for the app. This setup allows
you to redesign these components from a central place and have the changes reflected across the whole app.
All or most of our forms use the same components (FormContainer, FormInput, etc) so if the look of the
profile editing or registration pages is incorrect, they can be changed here. 

Files like UserIcon, Finger and Pencil are SVG components. I couldn't figure out a good and reliable way
to import custom icons such as the pointing finger on the POWERtalk website, so I used React Native SVG
to display images. You can find more about that here https://github.com/software-mansion/react-native-svg/blob/main/USAGE.md

Pretty much if you want to use these files in the app. At the top of the file you just need to write 
for example, import Finger from '@/PTComponents/Finger'; then insert the finger icon with <Finger/>
This can be seen in the profile page (app/profile/[profileID].tsx) on line 102.

You can also pass props (properties) to these components, which will change the components for a specific page.
This is used in the Button component and the BottomNav component. The Button component accepts a single onPress
property, which allows the code in the standalone page to communicate with the <TouchableOpacity> component
within the button. The BottomNav component is more complex, as it accepts an array of Names and an array of Links
so that the Navigation component at the bottom can display and function correctly on its standalone page, whilst
taking its styling from the component file.

Realistically the BottomNav should be replaced with the built in (tabs) system as seen on this page https://docs.expo.dev/router/basics/layout/
But we were inexperienced making an Expo app and our layout was too confusing to change to the system. We did not
have time so the BottomNav component is effectively a bandaid that kind of sucks to use. 