/*
	Description: Content script that is injected on each page loaded in the browser. When a message is sent to this script, this script converts the entire webpage
	into a JSON formatted message for the genotation-upload.js background script.
	Author: Ethan Willis
*/

chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		if(message.action == "GetPageContent") {
			// get webpage url
			url = document.location.href;
			// get webpage content
			page_content = document.documentElement.outerHTML;

			// Send message to background script to process this page and its content.
			chrome.runtime.sendMessage({"url": url, "page_content": page_content});
		}
	}
);
