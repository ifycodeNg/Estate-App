const inputs = document.querySelectorAll(".input");


function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}

function remcl(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove("focus");
	}
}


inputs.forEach(input => {
	input.addEventListener("focus", addcl);
	input.addEventListener("blur", remcl);
});

let sidebarOpen=false;
let sidebar=document.getElementById('sidebar')
let sidebarCloseIcon=document.getElementById('sidebarIcon')
function toggleSideBar() {
    if(!sidebarOpen){
        sidebar.classList.add("sidebar_responsive")
        sidebarOpen=true
    }
}
function closesideBar() {
    if(sidebarOpen){
        sidebar.classList.remove("sidebar_responsive")
        sidebarOpen=false
    }
}
if('serviceWorker' in navigator){
    console.log("service up")
    navigator.serviceWorker.register("/sw.js")
    .then(()=>{
        console.log("service worker registered")
    }).catch((err)=>console.log(err))
}
//  <td class="border px-8 py-4">
//             <a
//               class="rounded bg-green-700 px-6 py-2"
//               href="/resident/view/<%=body[i].domId%>"
//               ><span class="font-bold">View</span>
//             </a>
//           </td>
        