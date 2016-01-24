To install and test
===================



***Manual Build***
1.) Download and install [Firefox Nightly](https://nightly.mozilla.org/)

2.) Open Firefox Nightly, type about:config into the address bar and press enter.

3.) On the about:config page search for xpinstall.signatures.required and right click to toggle to false, or double click it until it's false.

4.) Clone this repository and navigate into the directory. From within the directory execute the command zip -r ../genotation_webextension.xpi *

5.) Drag and drop the new .xpi file onto Firefox. It will then prompt you to install Genotation. Click install.

6.) Browse to any webpage and click the Genotation button in the taskbar.

***Build Script***
chmod +x build.sh and run it. This will create a .XPI in the parent directory that you can drag onto Firefox. You will still need to follow step 3 in the manual build steps to install unsigned extensons.

Current State
=============
Currently this WebExtension successfully implements functionality to fetch the page content and URL via a content script and uses the message passing facilities of WebExtensions to give this information to a background script.

Next Steps
=============
The next steps are to modify the background script to send the content that is received from our content_script.js to Genotation via an API of some sort.


