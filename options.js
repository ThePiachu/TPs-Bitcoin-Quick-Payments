function cleanUpString(str)
{
	return str.replace(/\W/g, '');
}

function printAddresses(addresses)
{
	return addresses.replace(/\,/g,'\n')
}

function parseInputAddresses(toParse)
{
	var split = toParse.split("\n");
	var answer = new Array();
	for (var i=0;i<split.length;i++)
	{
		var tmp=cleanUpString(split[i]);
		if (CheckAddressForValidityWithNetByte(tmp, 0))
		{
			answer.push(tmp);
		}
	}
	return answer;
}

function saveIdentifier() {
	var identifier = document.getElementById("identifier").value;
	var password = document.getElementById("password").value;
	
	localStorage["identifier"] = identifier;
	
	chrome.runtime.sendMessage({request: "fetchAddresses", identifier: identifier, password: password});
	
	location.reload();
}

function saveAddresses() {
	var select = document.getElementById("addresses");
	var addressesInput = select.value;
	
	var addresses = parseInputAddresses(addressesInput);
	
	localStorage["bitcoinAddresses"] = addresses;
	
	location.reload();
}

// Restores select box state to saved value from localStorage.
function restoreOptions() {
	var addresses = localStorage["bitcoinAddresses"];
	if (addresses) {
		var select = document.getElementById("addresses");
		select.value=printAddresses(addresses);
	}
	
	var identifier = localStorage["identifier"];
	if (identifier) {
		var select = document.getElementById("identifier");
		select.value=identifier;
	}
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save2').addEventListener('click', saveAddresses);
document.querySelector('#save').addEventListener('click', saveIdentifier);