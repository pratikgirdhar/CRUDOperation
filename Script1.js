var TotalItemCount=0;
$(document).ready(function () { //UPDATED CODE START
//Remove datatable warnings on loading
$.fn.dataTable.ext.errMode = 'none';
var siteurl = _spPageContextInfo.webAbsoluteUrl;
var ItemCount= GetItemCount(siteurl, 'SiteTile');
createRestUrl(siteurl,ItemCount,'SiteTile');
});  //UPDATED CODE END

//Step 1. get total item count of threshold exceed list.
function GetItemCount(siteurl, ListName){
     var ItemCount='';
     $.ajax({
           url: "http://devsps/_api/web/lists/GetByTitle('DesktopReferesh')/ItemCount", 
           method: "GET",
           async: false,
           headers: { "Accept": "application/json; odata=verbose" },
           success: function (data) {
               ItemCount = data.d.ItemCount;
           },
            error: function (data) {
               console.log(data);
            }
     });
     return ItemCount;   
}
function createRestUrl(siteurl, ItemCount, ListName) {

        if(ItemCount<=5000) {
		//Item count less than 5000 so we limit it as usual 5000
        	var listServiceUrl = "http://devsps/_api/web/lists/GetByTitle('DesktopReferesh')/Items?$select=ID,FullName,UserID,SoftwareName&$top=5000";
	} else {
		//Item count more than 5000 so we split it in 1000 item per call
		var listServiceUrl = "http://devsps/_api/web/lists/GetByTitle('DesktopReferesh')/Items?$select=ID,FullName,UserID,SoftwareName&$top=1000";
        }
        
	//Step 3: Rest call to procerss each items of list
       	$.when(processList(listServiceUrl,ItemCount)).done(function () { });
}
function processList(nextUrl,ItemCount) {
   		
        var dfd = new $.Deferred();
        
        if (nextUrl == undefined) {
            dfd.resolve();
            return;
        }
		 
        //Step 4: Repetative call to getJSONDataFromUrl() to get Ajax Json object.
        getJSONDataFromUrl(nextUrl).done(function (listItems) {
        
        	TotalItemCount = TotalItemCount+listItems.d.results.length;
        	
           	var items = listItems.d.results;
                var next = listItems.d.__next;
			
                $.when(processList(next,ItemCount)).done(function (){
            	
                   dfd.resolve();
               
                });
            
            var tableHTML='';
            //Create datatable object
            var table = $('#subsiteList').DataTable();     
             $.each(items, function(index, obj){
			//tableHTML +='<tr><td>'+obj.ID+'</td><td>'+obj.FullName+'</td><td>'+obj.UserID+'</td><td>'+obj.SoftwareName+'</td></tr>';
			//tableHTML += "<tr><td>'+ obj.Title +'</td><td>'+obj.FullName+'</td><td>'+obj.UserID+'</td><td>'+obj.SoftwareTitle+'</td><td>'+obj.ComputerName+'</td><td>'+obj.CollectionName+'</td><td>'+obj.CollectionID+'</td><td><a href='#' data-target='#ModalForUpdateEmployee' data-toggle='modal' onclick='edit("+obj.Id+")'><img src='https://girdhar.sharepoint.com/sites/wiley/PA/SiteAssets/CRUD/003-edit-document.png'></a></td><td><a href='#' onclick='deleteItem("+obj.Id+");'><img src='https://girdhar.sharepoint.com/sites/wiley/PA/SiteAssets/CRUD/001-delete.png'></a></td></tr>";
            tableHTML += "<tr><td>"+ obj.ID +"</td><td>"+obj.FullName+"</td><td>"+obj.UserID+"</td><td>"+obj.SoftwareName+"</td><td><a href='#' data-target='#ModalForUpdateEmployee' data-toggle='modal' onclick='edit("+obj.Id+")'><img src='http://devsps/SiteAssets/CRUD/003-edit-document.png'></a></td><td><a href='#' onclick='deleteItem("+obj.Id+");'><img src='http://devsps/SiteAssets/CRUD/001-delete.png'></a></td></tr>";
			 }); 
             table.rows.add($(tableHTML)).draw(); //Append each list row to data tabel
             
      });
      return dfd.promise();
}

//Step 4: Repetative call to getJSONDataFromUrl() to get Ajax Json object.
function getJSONDataFromUrl(endpoint) {
        return jQuery.ajax({
            url: endpoint,
            method: "GET",
            headers: {
                "Accept": "application/json; odata=verbose",
                "Content-Type": "application/json; odata=verbose"
            }
        });
}

function createListItem()
{
//var eTitle = $('#txtTitle').val();
var eFullName = $('#txtFullName').val();
var eUserID= $('#txtUserID').val();
var eSoftwareTitle = $('#txtSoftwareTitle').val();
//var eComputerName = $('#txtComputerName').val();
//var eCollectionName = $('#txtCollectionName').val();
//var eCollectionID = $('#txtCollectionID').val();

$.ajax({
  
async: true,    
url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('DesktopReferesh')/items",
//url: http://devsps/_api/web/lists/GetByTitle('DesktopReferesh')/items",
method: "POST",
data: JSON.stringify({  
   // '__metadata':{'type': 'SP.Data.EmployeeListItem'},
	'__metadata':{'type': 'SP.Data.DesktopRefereshListItem'},
    //'Title' : eTitle,
    'FullName': eFullName,
    'UserID': eUserID,
    'SoftwareName': eSoftwareTitle
    //'ComputerName': eComputerName,
    //'CollectionName': eCollectionName,
    //'CollectionID': eCollectionID
}),
headers:{
"accept":"application/json;odata=verbose",
"content-type": "application/json;odata=verbose",
"X-RequestDigest": $("#__REQUESTDIGEST").val()
},
success: function(data){

//var eTitle = $('#txtTitle').val("");
var eFullName = $('#txtFullName').val("");
var eUserID= $('#txtUserID').val("");
var eSoftwareTitle = $('#txtSoftwareTitle').val("");
//var eComputerName = $('#txtComputerName').val("");
//var eCollectionName = $('#txtCollectionName').val("");
//var eCollectionID = $('#txtCollectionID').val("");

         swal( "Item created successfully", "success");

    if ($.fn.DataTable.isDataTable('#subsiteList')) {
        $('#subsiteList').DataTable().destroy();
    }
    $('#subsiteList tbody').empty();

    
createRestUrl();
},
error: function(error){
console.log(JSON.stringify(error));

}

})

}

function edit(value){

$.ajax({
  
    async: true,    
    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('DesktopReferesh')/GetItemByID("+value+")",
    method: "GET",

    headers:{
    "accept":"application/json;odata=verbose",
    "content-type": "application/json;odata=verbose"
    
    },
    success: function(data){
       //console.log(data.d.EmployeeTitle);
     //eTitle = $('#txtTitles').val(data.d.EmployeeTitle);
     eFullName = $('#txtFullnames').val(data.d.FullName);  
     eUserID= $('#txtUserIDs').val(data.d.UserID);
     eSoftwareTitle = $('#txtSoftwareTitles').val(data.d.SoftwareName);
     //eComputerName = $('#txtComputerNames').val(data.d.ComputerName);
     //eCollectionName = $('#txtCollectionNames').val(data.d.CollectionName);
     //eCollectionID = $('#txtCollectionIDs').val(data.d.CollectionID);
    
   
     
          },
    error: function(error){
    console.log(JSON.stringify(error));
    
    }
        

    })
  
 uId = value;
  }
  
  
function update(uId){
//var eTitle = $('#txtTitles').val();
var eFullName = $('#txtFullNames').val();
var eUserID= $('#txtUserIDs').val();
var eSoftwareTitle = $('#txtSoftwareTitles').val();
//var eComputerName = $('#txtComputerNames').val();
//var eCollectionName = $('#txtCollectionNames').val();
//var eCollectionID = $('#txtCollectionIDs').val();

$.ajax({
  
   
url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('DesktopReferesh')/items("+ uId +")",
method: "POST",
data: JSON.stringify({  
    '__metadata':{'type': 'SP.Data.DesktopRefereshListItem'},
    //'EmployeeTitle' : eTitle,
    'FullName': eFullName,
    'UserID': eUserID,
    'SoftwareName': eSoftwareTitle
    //'BloodGroup': eComputerName,
    //'CommunicationAddress': eCollectionName,
    //'EmergencyContact': eCollectionID
}),
headers:{
"accept":"application/json;odata=verbose",
"content-type": "application/json;odata=verbose",
"X-RequestDigest": $("#__REQUESTDIGEST").val(),
"IF-MATCH": "*",
"X-HTTP-Method":"MERGE"
},
success: function(data){
swal( "Item Updated successfully", "success");

    if ($.fn.DataTable.isDataTable('#subsiteList')) {
        $('#subsiteList').DataTable().destroy();
    }
    $('#subsiteList tbody').empty();

    
createRestUrl();
},
error: function(error){
console.log(JSON.stringify(error));

}

})


}

function deleteItem(value){

$.ajax({
  
   
url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('DesktopReferesh')/items("+ value +")",
method: "POST",
headers:{
"accept":"application/json;odata=verbose",
"content-type": "application/json;odata=verbose",
"X-RequestDigest": $("#__REQUESTDIGEST").val(),
"IF-MATCH": "*",
"X-HTTP-Method":"DELETE"
},
success: function(data){

swal("Deleted!", "Item Deleted successfully", "success");

    if ($.fn.DataTable.isDataTable('#subsiteList')) {
        $('#subsiteList').DataTable().destroy();
    }
    $('#subsiteList tbody').empty();

    
createRestUrl();
},
error: function(error){
console.log(JSON.stringify(error));

}

})


}

