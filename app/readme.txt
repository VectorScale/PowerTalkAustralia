This is the app folder, the place where the Expo Router looks for a place to open the app.
This will be index.tsx, which is just a basic page which allows the user to navigate to 
either the login page or the meeting page.

In every folder there is a _layout.tsx file which describes the general layout of the route. 
Every subfolder such as login or profile or editProfile has one. The root layout, in this folder,
describes app wide options such as whether or not to show the status bar on android, as well
as fonts that are needed in the app. It's also the reference to the Header component, found in 
the PTComponents folder. The header is described here so that it applies to the entire app without
having to write it into every subfolders layout file.

What is described in the subfolders layout files is the Subheader component. That's the blue ribbon
under the header which has a title for the current page. In the file it also gives a default title for
each of the pages. In the Stack.Screen sections of the layout files you will see the name of the Screen
which is just the file name without the extension (index for index.tsx) and the options. For the index
page, the header is not shown. In the subfolders, the options typically set the default title here.

Some of the files may need to be changed if more pages are added to the app. Expo Router typically uses
'index.tsx' as the default page for a route. So the file 'login/index.tsx' is just routed as /login.
However some of our pages are written in .js. if there is an index page with the .js file extension, it won't
be recognised as the index page and I think Expo just chooses alphabetically.

Finally, this folder is also where special pages live, such as +not-found.tsx. This pages is automatically
routed to in the event that Expo doesn't find a page at the specified URL. This typically won't happen unless
There is a database error or a data mismatch between SQL tables. You can find more about these special pages here:
https://docs.expo.dev/router/basics/notation/

