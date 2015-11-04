/*
	Description: Background script to respond to plugin button clicks, grab web pages and documents, and upload them to genotation.
	Author: Ethan Willis
*/

// When the plugin icon is clicked
chrome.browserAction.onClicked.addListener(handleClick);
function handleClick(tab) {
	// Test message to show the structure of the tab webextensions object.
	chrome.notifications.create({
		"type": "basic",
		"iconUrl": chrome.extension.getURL("genotation_icon.png"),
		"title": "Genotating",
		"message": "Fetching page content"
	});
	// Send a message to the content_script running on the page.
	chrome.tabs.sendMessage(tab.id, {action: "GetPageContent"});
}

// Handle messages from our content script running on the webpage.
chrome.runtime.onMessage.addListener(handleMessage);
function handleMessage(message) {
	url = message.url;
	page_content = message.page_content;
	chrome.notifications.create({
		"type": "basic",
		"iconUrl": chrome.extension.getURL("genotation_icon.png"),
		"title": "Content For: " + url,
		"message": page_content
	});
}
