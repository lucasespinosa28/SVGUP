const uploadBtn = document.getElementById("uploadBtn");
const listBtn = document.getElementById("listBtn");
//hidden
let hiddenList = true;
let hiddenUpload = true;

uploadBtn.addEventListener("click", (e) => {
  document.getElementById("uploadContent").className = "flex flex-col";
  document.getElementById("listContent").className = "hidden";
});

listBtn.addEventListener("click", (e) => {
  document.getElementById("listContent").className = "flex flex-col";
  document.getElementById("uploadContent").className = "hidden";
});


//const loginBtn = document.getElementById("loginBtn");
//const logoutBtn = document.getElementById("logoutBtn");

//loginBtn.addEventListener("click", (e) => {
//  document.getElementById("loginBtn").className = "hidden";
//  document.getElementById("logoutBtn").className = "bg-green-800 text-gray-50 m-2 px-4 py-2 shadow-xl rounded  active:shadow";
//});

//logoutBtn.addEventListener("click", (e) => {
//  document.getElementById("loginBtn").className = "bg-green-500 text-white m-2 px-4 py-2 shadow-xl rounded  active:shadow";
//  document.getElementById("logoutBtn").className = "hidden";
//});
