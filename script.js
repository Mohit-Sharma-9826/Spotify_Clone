var currentSong = new Audio();
var currfolder;
var songs;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

async function getSongs(folder){
    currfolder = folder;
    let a = await fetch(`/${folder}/`);
    let respond = await a.text();
    // console.log(respond);
    let div = document.createElement("div");
    div.innerHTML = respond;
    let as = div.getElementsByTagName("a");
    // console.log(as);
    let songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if(element.href.endsWith("mp3")){
            songs.push(element.href);
        }
    }

     // <---------- MAIN ---------->
     let songlist = document.querySelector(".playlist > ul");
     songlist.innerHTML = "";
 
     for(let i=0; i<songs.length; i++){
         let str = songs[i].split(`${currfolder}/`);
         let splited = str[1].replaceAll("%20", "-");
         // console.log(splited);
         songlist.innerHTML = songlist.innerHTML + `<li id="list${i+1}">
                                 <div class="playKaDiv">
                                     <img src="svg/music.svg" alt="">
                                     ${splited}
                                 </div>
                                 <div class="playKaDiv">
                                     
                                     <img src="svg/play.svg" alt="">
                                 </div>
                             </li>`;
     }
 
     //Attach event listener to each songs
     Array.from(document.querySelector(".playlist").getElementsByTagName("li")).forEach(e=>{
         e.addEventListener("click", ()=>{
             let path = e.getElementsByTagName("div")[0].innerText;
             playMusic(path);
         });
     });

    return songs;

}

const playMusic = (track, pause = false)=>{
    let string = `${currfolder}/` + track.replaceAll("-","%20");
    // console.log(string);
    currentSong.src = string;
    if(!pause){
        currentSong.play();
        play.src = "svg/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00.00";
}

async function displayAlbum(){
    //Get the list of all songs  
    songs = await getSongs(`songs/SF1`);
    // console.log(currfolder);
    let str1 = songs[0].split(`${currfolder}/`)[1];
    playMusic(str1.replaceAll("%20", "-"), true);

    let a = await fetch(`/songs/`);
    let respond = await a.text();
    let div = document.createElement("div");
    div.innerHTML = respond;
    let cardCont = document.querySelector(".cardContainer");
    let as = div.getElementsByTagName("a");
    let arr = Array.from(as);
    var fold;
    for(let i=0; i<arr.length; i++){
        const e = arr[i];
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
            fold = e.href.split("/songs")[1].split("/")[1];
            
            //Get the Metadata of the folder
            let a = await fetch(`/songs/${fold}/info.json`);
            let respond = await a.json();
            cardCont.innerHTML = cardCont.innerHTML + `<div class="card" data-folder="${fold}">
            <img src="songs/${fold}/cover.jpeg" alt="">
            <button class="greenbtn"><img src="svg/greenbtn.svg" alt=""></button>
            <h2>${respond.title}</h2>
            <p>${respond.description}</p>
            </div>`;
        }
    }

    var firstFolder = (arr[1].href.split("/songs")[1].split("/")[1]);
    //Get the list of all songs  
    songs = await getSongs(`songs/${firstFolder}`);
    let str3 = songs[0].split(`${currfolder}/`)[1];
    playMusic(str3.replaceAll("%20", "-"), true);

    //Load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            let strr = songs[0].split(`${currfolder}/`)[1];
            playMusic(strr.replaceAll("%20","-"),true);
        });
    });

    // return fold;
}

async function main() {
    // Display all the albums on the page
    displayAlbum();

    //Attach event listener to play, previous and next button
    let play = document.querySelector("#play")
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "svg/pause.svg";
        }
        else{
            currentSong.pause();
            play.src = "svg/play.svg";
        }
    });

    let pre = document.querySelector("#pre")
    pre.addEventListener("click",()=>{
        for(let i=0; i<songs.length; i++){
            try{
                if(currentSong.src == songs[i]){
                    let str2 = songs[i-1].split(`${currfolder}/`)[1];
                    playMusic(str2.replaceAll("%20", "-"));
                    break;
                }
            }
            catch{
                console.log("This is the First Song");
            }
        }
    });

    let next = document.querySelector("#next")
    next.addEventListener("click",()=>{
        for(let i=0; i<songs.length; i++){
            try{
                if(currentSong.src == songs[i]){
                    let str2 = songs[i+1].split(`${currfolder}/`)[1];
                    playMusic(str2.replaceAll("%20", "-"));
                    break;
                }
            }
            catch{
                console.log("This is the Last Song");
            }
        }
    });

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate",()=>{
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    });

    //Add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent)/100;
        // console.log(currentSong.currentTime, percent);
    });

    //spawning the left in mobile
    document.querySelector(".navimg1").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0%";
    });

    //removing the left in mobile
    document.querySelector("#cross").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-100%";
    });

    //Add event listener to volume input
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e=>{
        // console.log("Setting volume",e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value)/100;
        
    });

    //Add event listener to volume
    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click", e=>{
        console.log(e.target);
        
        if(e.target.src.includes("svg/volume.svg")){
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            currentSong.volume = 0;
            e.target.src = e.target.src.replace("svg/volume.svg","svg/mute.svg");
        }
        else{
            document.querySelector(".range").getElementsByTagName("input")[0].value = 40;
            currentSong.volume = 0.4;
            e.target.src = e.target.src.replace("svg/mute.svg","svg/volume.svg");
        }
    });
        
}
main();
