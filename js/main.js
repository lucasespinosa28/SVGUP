import { SkynetClient} from "skynet-js";
import { ContentRecordDAC } from "@skynetlabs/content-record-library";
const port = "https://siasky.net/";

const hostApp = window.location.hostname.replace(".siasky.net", "");
function changeCSS(name, css) {
  document.getElementById(name).className = css;
}

function changeHTML(name, html) {
  document.getElementById(name).innerHTML = html;
}


const onUploadProgress = (progress, { load, total }) => {
  if (Math.round(progress * 100) < 100) {
    changeHTML("optimizedOuput", `Uploading:${Math.round(progress * 100)}%`);
  }
}

const client = new SkynetClient(port, { onUploadProgress });
const dataKey = "StoragedSVG";

function LoginHandler(_mySky) {
  changeCSS("loginBtn","bg-green-500 text-white m-2 px-4 py-2 shadow-xl rounded  active:shadow")
  loginBtn.addEventListener("click", () => {
    _mySky.requestLoginAccess().then(data => {
      if (data) {
        changeCSS("logoutBtn","bg-green-800 text-gray-50 m-2 px-4 py-2 shadow-xl rounded  active:shadow")
        changeCSS("loginBtn", "hidden")
        initMySky()
      }
    });
  });
}

function LogoutHandler(_mySky) {
  _mySky.logout().then(() => {
    changeCSS("loginBtn", "bg-green-500 text-white m-2 px-4 py-2 shadow-xl rounded  active:shadow");
    changeCSS("logoutBtn", "hidden");
    changeCSS("listBtn", "hidden");
    changeCSS("uploadBtn", "hidden");
    changeCSS("alertLogin", "font-bold text-3xl text-yellow-500");
    changeCSS("idOutput", "hidden");
    changeHTML("idOutput", "");
    initMySky()
  });
}

async function storeJson(_mySky, _dac, _hostApp, _dataKey, _id, _link, _json) {
  try {
    await _mySky.setJSON(`${_hostApp}/${_dataKey}/${_id}`, _json);
    try {
      await _dac.recordInteraction({ skylink: _link, metadata: { action: 'new upload' } })
    } catch (err) {
      console.error(`error with CR DAC: ${err.message}`);
    }
  } catch (err) {
    console.error(err);
  }
}

async function upload(file, _mySky, _dac,_id){
  try {
    _mySky.connector.client.uploadFile(file).then(data => {
      _dac.recordNewContent({ skylink: data.skylink }).then(data => console.log(data)).catch(err => console.log(`error with CR DAC: ${err.message}`));
      _mySky.connector.client.getSkylinkUrl(data.skylink)
        .then(link => {
          changeHTML("optimizedOuput", `File Uploaded:<a target="_blank" href="${link}">https://siasky.net/...</a>`);
          try {
            _mySky.getJSON(`${hostApp}/${dataKey}/${_id}`)
              .then((data) => {
                if (data.data == null) {
                  storeJson(_mySky, _dac, hostApp, dataKey, _id, link, JSON.parse(`{"uploads":[{"name":"${Date.now()}.svg","link":"${link}","date":${Date.now()}}]}`));
                } else {
                  let Json = data.data;
                  Json['uploads'].push({ "name": `${Date.now()}.svg`, "link": link, "date": Date.now() });
                  storeJson(_mySky, _dac, hostApp, dataKey, _id, link, Json);
                }
              });
          } catch (err) {
            console.error(err);
          }
        });
    });
  } catch (err) {
    console.error(err);
  }
}

const TabletColor = n => n % 2 == 0 ? "bg-yellow-100" : "bg-yellow-200";

async function showTable(_mySky,_id) {
  const body = document.getElementById("tableBody");
  body.innerHTML = "";
  const result = await _mySky.getJSON(`${hostApp}/${dataKey}/${_id}`);
  if (result.data != null) {
    for (var i = 0; i < result.data.uploads.length; i++) {
      body.innerHTML += `<tr class="${TabletColor(i)}"><td class="border-2  border-yellow-500 mx-2 p-2">${result.data.uploads[i].name}</td><td class="border-2  border-yellow-500  p-2"><a class="mx-4 text-blue-500 underline"  target="_blank" href="${result.data.uploads[i].link}">${result.data.uploads[i].link}</a></td> <td class="border-2   border-yellow-500 mx-2  p-2">${new Date(result.data.uploads[i].date).toLocaleDateString()}</td></tr>`
    }
  }
}



async function initMySky() {
  try {
    const mySky = await client.loadMySky(hostApp);
    const dac = new ContentRecordDAC()
    await mySky.loadDacs(dac);
    const loggedIn = await mySky.checkLogin();
    if (loggedIn) {
      changeCSS("alertLogin", "hidden")
      changeCSS("uploadBtn", "bg-yellow-500 text-gray-50 m-2 px-4 py-2 shadow-xl rounded active:shadow")
      changeCSS("listBtn", "bg-yellow-500 text-gray-50 m-2 px-4 py-2 shadow-xl rounded active:shadow")
      const id = await mySky.connector.connection.remoteHandle().call("userID");
     
        document.getElementById("UploadBtn").addEventListener("click", async () => {
        const svgElement = document.getElementsByTagName("svg");
        if (svgElement.length > 0) {
          const file = new File([svgElement[0].outerHTML], "HelloWorld.svg", {
            type: "image/svg+xml",
          });
          upload(file, mySky, dac, id);
        }
      });
      document.getElementById("listBtn").addEventListener("click",() => showTable(mySky,id));
      changeCSS("idOutput", "inline-block align-middle mt-4 mx-8");
      changeHTML("idOutput", `Id :${id}`);
      changeCSS("logoutBtn", "bg-green-800 text-gray-50 m-2 px-4 py-2 shadow-xl rounded  active:shadow");
      document.getElementById("logoutBtn").addEventListener("click",() => LogoutHandler(mySky));      
    } else {
      LoginHandler(mySky);
    }

  } catch (e) {
    console.error(e);
  }
}

initMySky()


