function callback(variable){
	//getting all addresses into one array
	var array = new Array();
	for (var i=0;i<variable.length;i++)
	{
		for (j=0;j<variable[i].length;j++)
		{
			array.push(variable[i][j]);
		}
	}
	//removing duplicates
	var addresses = new Array();
	var toAdd = true;
	
	for (var i=0;i<array.length;i++)
	{
		toAdd=true;
		for (var j=0;j<addresses.length;j++)
		{
			if (array[i]==addresses[j])
			{
				toAdd=false;
			}
		}
		if (toAdd)
		{
			addresses.push(array[i]);
		}
	}
	
	if (addresses.length>0)
	{
		//printing them out
		for (var i=0;i<addresses.length;i++)
		{
			newAddressWithAddress(addresses[i]);
		}
	} else {
		//nothing found
		setNotice("No matching addresses found");
	}
}

function handleTabs(tabs){
	for (var i=0;i<tabs.length;i++){
		chrome.tabs.executeScript(null, {file: "bitcoinjs-min.js"});
		chrome.tabs.executeScript(null, {file: "BitcoinAddress.js"});
		chrome.tabs.executeScript(null, {file: "contentScript.js"}, callback);
	}
}

function scour() {
	clearNotice();
	clearTXID();
	chrome.tabs.query({active: true}, handleTabs);
}

function clearPassword()
{
	document.getElementById("password").value="";
	document.getElementById("2factor").value="";
}

function setNotice(notice)
{
	var noticeParagraph=document.getElementById("notice");
	noticeParagraph.className="visible";
	noticeParagraph.innerHTML=notice;
	window.scrollTo(0, 0);
}

function clearNotice()
{
	var notice=document.getElementById("notice");
	notice.className="hidden";
	notice.value="";
}

function setTXID(txid)
{
	var txidParagraph=document.getElementById("txid");
	txidParagraph.className="visible";
	txidParagraph.innerHTML=txid;
}

function clearTXID()
{
	var txid=document.getElementById("txid");
	txid.className="hidden";
	txid.value="";
}

function makeFirstDivVisible()
{
	document.getElementById("firstDiv").className="visible";
	document.getElementById("secondDiv").className="hidden";
}

function makeSecondDivVisible()
{
	document.getElementById("secondDiv").className="visible";
	document.getElementById("firstDiv").className="hidden";
}

function prepare()
{
	clearNotice();
	clearTXID();
	
	var addresses=document.getElementsByName("address");
	var amounts=document.getElementsByName("amount");
	
	var table=document.getElementById("BitcoinAddresses2");
	while (table.rows.length>1)
	{
		table.deleteRow(-1);
	}
	
	for (var i=0;i<addresses.length;i++)
	{//checking for invalid addresses
		if ((addresses[i].value!="") && !CheckAddressForValidityWithNetByte(addresses[i].value, 0))
		{
			setNotice("" + addresses[i].value + " is not a valid Bitcoin address, please fix or delete the entry.");
			return;
		}
	}
	
	for (var i=0;i<addresses.length;i++)
	{
		if ((addresses[i].value!="") && (CheckAddressForValidityWithNetByte(addresses[i].value, 0) && (parseFloat(amounts[i].value)>0.0)))
		{
			var row = table.insertRow(-1);
			var cell1=row.insertCell(0);
			var cell2=row.insertCell(1);
			
			cell1.setAttribute("name","addressToSend");
			cell1.setAttribute("value",addresses[i].value);
			var cellText=document.createTextNode(addresses[i].value);
			cell1.appendChild(cellText);
			
			cell2.setAttribute("name","amountToSend");
			cell2.setAttribute("value",amounts[i].value);
			cellText=document.createTextNode(parseFloat(amounts[i].value));
			cell2.appendChild(cellText);
		}
	}
	
	if (table.rows.length<2)
	{
		setNotice("No valid Bitcoin addresses or transfer amounts specified.");
		return;
	}
	
	document.getElementById("identifier").value=localStorage["identifier"];
	
	makeSecondDivVisible();
}

function send()
{
	var identifier=document.getElementById("identifier");
	var password=document.getElementById("password");
	var password2=document.getElementById("2factor");
	
	clearNotice();
	clearTXID();
	
	if (identifier.value=="")
	{
		setNotice("Identifier not specified");
		return;
	}
	if (password.value=="")
	{
		setNotice("Password not specified");
		return;
	}
	
	var addresses=document.getElementsByName("addressToSend");
	var amounts=document.getElementsByName("amountToSend");
	
	var addressToCall="https://blockchain.info/merchant/"+identifier.value+"/sendmany?password="+password.value;
	if (password2.value!="")
	{
		addressToCall=addressToCall+"&second_password="+password2.value;
	}
	
	var recipients="{"
	for (var i=0;i<addresses.length;i++)
	{
		recipients=recipients+"\""+addresses[i].innerText+"\""+":"+parseInt(""+(parseFloat(amounts[i].innerText)*100000));
		if (i<addresses.length-1)
		{
			recipients=recipients+",";
		}
	}
	recipients=recipients+"}";
	addressToCall=addressToCall+"&recipients="+recipients;
	
	console.log(addressToCall);
	
	var xhr	= new XMLHttpRequest();
	xhr.open("GET", addressToCall);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var resp = JSON.parse(xhr.responseText);
				
				if (resp["error"])
				{
					setNotice("Error from blockchain - "+resp["error"]);
				} else {
				//tx_hash
					setTXID("Operation successful. <a href=\"http://blockchain.info/tx/"+resp["tx_hash"]+"\">Check it online.</a>");
					makeFirstDivVisible();
				}
			}
		}
	}
	xhr.send();
	
	clearPassword();
}

function Cancel()
{
	clearNotice();
	clearTXID();
	
	makeFirstDivVisible();
	clearPassword();
}

function newAddress()
{
	var table=document.getElementById("BitcoinAddresses");
	var numberOfrows=table.rows.length-1;
	var row = table.insertRow(-1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);

	cell1.innerHTML="<input type=\"text\" id=\"address"+numberOfrows+"\" name=\"address\" size=35 value=\"\"></input>";
	cell2.innerHTML="<input type=\"text\" id=\"amount"+numberOfrows+"\" name=\"amount\" size=5 value=\"0.0\"></input>";
}

function newAddressWithAddress(address)
{
	var table=document.getElementById("BitcoinAddresses");
	var numberOfrows=table.rows.length-1;
	var row = table.insertRow(-1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);

	cell1.innerHTML="<input type=\"text\" id=\"address"+numberOfrows+"\" name=\"address\" size=35 value=\""+address+"\"></input>";
	cell2.innerHTML="<input type=\"text\" id=\"amount"+numberOfrows+"\" name=\"amount\" size=5 value=\"0.0\"></input>";
}

document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('#newAddress').addEventListener('click', newAddress);
	document.querySelector('#prepare').addEventListener('click', prepare);
	document.querySelector('#send').addEventListener('click', send);
	document.querySelector('#scour').addEventListener('click', scour);
	document.querySelector('#cancel').addEventListener('click', Cancel);
	
	
});