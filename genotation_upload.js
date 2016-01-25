/*
	Description: Background script to respond to plugin button clicks, grab web pages and documents, and upload them to genotation.
	Author: Ethan Willis
*/

// When the plugin icon is clicked
chrome.browserAction.onClicked.addListener(handleClick);
function handleClick(tab) {
	// Send a message to the content_script running on the page.
	chrome.tabs.sendMessage(tab.id, {action: "get_page_content"});

	// Send notification that we are fetching the page content.
	chrome.notifications.create({
		"type": "basic",
		"iconUrl": chrome.extension.getURL("genotation_icon.png"),
		"title": "Genotating",
		"message": "Fetching page content"
	});

}

// Handle messages from our content script running on the webpage.
chrome.runtime.onMessage.addListener(handleMessage);
function handleMessage(message) {
	url = message.url;
	content = message.content;
	content_type = message.content_type
	chrome.notifications.create({
		"type": "basic",
		"iconUrl": chrome.extension.getURL("genotation_icon.png"),
		"title": "content-type: " + content_type + " Content For: " + url,
		"content": content
	});
}
