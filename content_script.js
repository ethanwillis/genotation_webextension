/*
	Description: Content script that is injected on each page loaded in the browser. When a message is sent to this script, this script converts the entire webpage
	into a JSON formatted message for the genotation-upload.js background script.
	Author: Ethan Willis
*/

// Build a message to send to the background script.
function build_message(url_string, content, content_type) {
	message = {"url": url_string, "content": content, "content_type": content_type};
	return message;
}

// Send message to background script to handle sending the page content to a web service.
function send_message(message) {
	chrome.runtime.sendMessage(message);
}

// Base64 encodes an array buffer. 
function base64_encode(data) {
	var binary = '';
	var bytes = new Uint8Array( buffer );
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode( bytes[ i ] );
	}
	return window.btoa( binary );
}

/**
 * The following three function handle_* take an xhr response, and send the URL content, content_type, and URL string to a background script so it can be sent off to a webservice. Each of these handle_* functions handles an xhr response for the varying content_types that Genotation supports. Currerntly the supported types are HTML files and PDF files.
 */
function handle_pdf(xhr_response, content_type) {
	url_string = xhr_response.responseURL;

	// Coerce response to be an array buffer for base64 encoding.
	xhr_response.responseType = "arrayBuffer";

	// Encode response
	url_content = base64_encode(xhr_response.response);
	
	message = build_message(url_string, url_content, content_type);

	// send message to background script.
	send_message(message);
}

function handle_html(xhr_response, content_type) {
	url_string = xhr_response.responseURL;

	url_content = xhr_response.response;

	message = build_message(url_string, url_content, content_type);

	// send message to background script.
	send_message(message);
}

function handle_unsupported(xhr_response, content_type) {
	url_string = xhr_response.responseURL;

	url_content = xhr_response.response;

	message = build_message(url_string, url_content, 'unsupported');

	// send message to background script.
	send_message(message);
}


/*
 * Gets a file via XHR from a URL. Then returns an object containing
 * the content, file MIME type, and url
 */
function get_url_xhr(url_string) {
	var xhr_request = new XMLHttpRequest();
	xhr_request.open("GET", url_string, true);

	xhr_request.onload = function(xhr_response) {
		content_type_regex = new RegExp(/(^text\/html)|(^text\/htm)|(^application\/pdf)/);
		content_type_header = xhr_response.getResponseHeader('content-type');
		content_type = content_type_regex.exec(content_type_header);
		
		// handle file content based on content-type returned by server.
		if(content_type == null) {
			handle_unsupported(xhr_response, content_type);
		} else if(content_type[1] == "text/html")
			handle_html(xhr_response, content_type[1]);
		} else if(content_type[2] == "text/htm") {
			handle_html(xhr_response, content_type[2]);
		} else if(content_type[3] == "application/pdf") {
			handle_pdf(xhr_response, content_type[3]);
		}
	}	
}

chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		if(message.action == "get_page_content") {
			// get webpage url
			url_string = document.location.href;
			
			// get the URL over xhr and send the page content and metadata as a message to the background script.
			get_url_xhr(url_string);
		}
	}
);
