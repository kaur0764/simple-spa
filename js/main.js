'use strict'

const APP = {

    baseURL: `https://api.themoviedb.org/3/`,
    apiKEY: `8d4732ba7ba71c8428eb25ce548539f2`,
    imgBaseUrl:`https://image.tmdb.org/t/p/w154/`,
    hasPopped:false,
    init: () => {

        NAV.addHash()
        window.addEventListener("popstate", SEARCH.searchActor);

        /* Calling searchActor function when button is clicked */
        let button=document.querySelector('button')
        button.addEventListener('click', SEARCH.searchActor) 
    }
}

//search is for anything to do with the fetch api
const SEARCH = {
    results:'',
    searchValue: document.getElementById('search').value,    
    searchActor(ev){

        /*Checks if function called on popstate event */
        if(ev.type=='popstate'){
            APP.hasPopped=true
            let hash=location.hash.replace('#','').split('/')[0]
            if(hash==''){
            ACTORS.showInstructions()
            }
            SEARCH.searchValue=hash
        }
        else{
        ev.preventDefault()
        /* Fetching actors info based on name typed in search bar */
        SEARCH.searchValue = document.getElementById('search').value
        }

        let searchValueLowerCase=SEARCH.searchValue.toString().toLowerCase()
        let localResults= JSON.parse(localStorage.getItem(searchValueLowerCase))
        if(!localResults){ //If not present in local storage 
            if(SEARCH.searchValue){ //If searchfield wasn't empty              
                SEARCH.overlay();

                let url= `${APP.baseURL}search/person?query=${SEARCH.searchValue}&api_key=${APP.apiKEY}`
                
                fetch(url)
                .then( response=>{
                    if(response.ok){
                        return response.json() 
                    }
                    else{
                        throw new Error("Wrong HTTP")
                    }
                })
                .then( data=>{
                    SEARCH.results=data.results
                    STORAGE.addToStorage(SEARCH.searchValue)
                    ACTORS.showActors()
                })  
                .catch( (err)=>console.log( 'ERROR:', err.message)) 
            }
        }
        else{
            SEARCH.results=localResults
            ACTORS.showActors()
        }
    },
    /* Handling loading animation overlay */
    overlay(){
        let overlayDiv= document.querySelector('.overlay')
        let spinner= document.querySelector('.spinner')
        overlayDiv.classList.add('display')
        let times=0 //No. of frames
        let deg=0
        window.requestAnimationFrame(loadingAnimation)
        
        function loadingAnimation(){
            times++
            deg=deg+5
            spinner.style.transform=`rotate(${deg}deg)`
            if(times<=213){ //spinner completes full rotation three times
                requestAnimationFrame(loadingAnimation)
            }
            else{
                overlayDiv.classList.remove('display')
            }
        }
    }
}

//actors is for changes connected to content in the actors section
const ACTORS = {
    instructions: document.querySelector('#instructions'),
    media: document.querySelector('#media'),
    actors: document.querySelector('#actors'),
    
    sortDiv: document.querySelector('.header-col .sort'),
    sortName:document.querySelector('.sort-name'),
    sortPopularity:document.querySelector('.sort-popularity'),

    addActive(section){
        instructions.classList.remove('active')
        media.classList.remove('active')
        actors.classList.remove('active') 
        section.classList.add('active') 
        
        ACTORS.sortDiv.classList.remove('show')

        if(MEDIA.popped) {
            MEDIA.popped=false
        }
        else{
            NAV.addHash(APP.hasPopped)
        }  
    },

    sort(){
        /*Add sorting controls*/     
        ACTORS.sortDiv.classList.add('show')

        ACTORS.sortName.addEventListener('click', ACTORS.sortResults)
        ACTORS.sortName.classList.add('ascend')

        ACTORS.sortPopularity.addEventListener('click', ACTORS.sortResults)
        ACTORS.sortPopularity.classList.add('ascend')
    },

    sortResults(ev){ 
        /*Sorting*/   
        let value
        let sortClass
        if(ev.target==ACTORS.sortName){
            value = 'name'
            sortClass=ACTORS.sortName
        }
        else{
            value='popularity'
            sortClass=ACTORS.sortPopularity
        }

        SEARCH.results.sort(function (a,b){
            let valueA = a[value]
            let valueB = b[value] 
            if(value=='name'){
                valueA.toUpperCase(); 
                valueB.toUpperCase(); 
            }
            
            if(sortClass.classList.contains('descend')){
                if(valueA<valueB) return 1
                if(valueA>valueB) return -1;
                else return 0;
            }
            
            if(sortClass.classList.contains('ascend')){
                if(valueA<valueB) return -1
                if(valueA>valueB) return 1;
                else return 0;
            }
        })
            sortClass.classList.toggle('ascend')
            sortClass.classList.toggle('descend')
            ACTORS.getActors();
        },

    showActors(){

        /* Removing active class from instructions section and adding  to actors section */
        ACTORS.addActive(ACTORS.actors)

        let actorsHeading = document.querySelector('#actors h2')
        actorsHeading.addEventListener('click', ACTORS.showInstructions)

        ACTORS.sort()
        ACTORS.getActors();
    },

    getActors(){
        /* Removing old search results */
        let actorsContent = document.querySelector('#actors .content')
        actorsContent.textContent='' 
        
        /*If no results are returned*/
        if(SEARCH.results.length===0){   
            let p = document.createElement('p')
            p.textContent="No results found"
            actorsContent.append(p)
        }

        SEARCH.results.forEach(result=>{
            
            if(result.known_for_department==='Acting'){  // Checking if the person is an actor
                
                /* div element to store each actor's info */
                let divA = document.createElement('div')
                divA.className='actor'
                
                /* Getting actor's info */
                let imgPath = result.profile_path
                let knownFor=result.known_for
                let id=result.id
                
                divA.setAttribute('data-id',id)
                
                /* Getting actor's most popular work */
                let bestKnownFor
                let mediaType
                if(knownFor[0].title){
                    bestKnownFor=knownFor[0].title
                    mediaType='movie'
                }
                else{
                    bestKnownFor=knownFor[0].name
                    mediaType='show'
                } 
                
                /* Put all the info in div */
                divA.innerHTML=`<img src=${APP.imgBaseUrl}${imgPath}></img>
                            <p>${result.name }</p>
                            <p>Popularity - ${result.popularity}</p>
                            <p>Best known for ${mediaType} "${bestKnownFor}"</p>`
                actorsContent.append(divA)
                divA.addEventListener('click',MEDIA.showMedia)
                
            }
        })
    },
    
    showInstructions(){
        ACTORS.addActive(ACTORS.instructions)
        document.getElementById('search').value=''
    }
}

//media is for changes connected to content in the media section
const MEDIA = {
    actorId:'',
    popped:false,

    showMedia(ev){

        window.scroll({top: 0, left: 0, behavior: 'instant'});//scroll to top

        if(!ev){ //If the function was called within code by addHash function
            MEDIA.actorId=location.hash.replace('#','').split('/')[1]
            MEDIA.popped=true
        }
        else{
        MEDIA.actorId=ev.currentTarget.dataset.id
        }
        /* Removing active class from actors section and adding  to media section */
        ACTORS.addActive(ACTORS.media)

        let mediaHeading = document.querySelector('#media h2')
        mediaHeading.addEventListener('click', ACTORS.showActors)

        /* Removing old search results */
        let mediaContent = document.querySelector('#media .content')
        mediaContent.textContent=''

        let results=SEARCH.results
        results.forEach(result=>{
            if(result.id==MEDIA.actorId){
            let knownFor=result.known_for
            knownFor.forEach(media=>{
                
                let posterPath = media.poster_path
                let mediaName
                let year
                let vote=media.vote_average
                let id=media.id
                
                if(media.media_type==='movie'){
                    mediaName=media.title
                    year=media.release_date.split('-')[0]
                }
                else{
                    mediaName=media.name
                    year=media.first_air_date.split('-')[0]
                }
                
                /* div element to store each media's info */
                let divM = document.createElement('div')
                divM.innerHTML=` <p>${media.media_type}</p>
                                <img src=${APP.imgBaseUrl}${posterPath}></img>
                                <p>${mediaName }</p>
                                <p>(${year})</p>
                                <p>Ratings-${vote}</p>`
                
                divM.dataset.id=id
                let colour=MEDIA.ratingsColour(vote)
                divM.lastChild.style.color=colour
                
                mediaContent.append(divM)
            })
            }   
        })
    },
    ratingsColour(rating){ 
        if(rating<3)
        {
        return("#F24444")
        }
        else if(rating<5){
        return("#F28D35")
        }
        else if(rating<7){
            return("#F2D335")
        }
        else if(rating<9){
            return("#B7C928")
        }
        else{
            return("#62D92B")
        }
    }
}

//storage is for working with localstorage
const STORAGE = {
    addToStorage(searchValue){
        let searchKey=searchValue.toString().toLowerCase()
        localStorage.setItem(searchKey, JSON.stringify(SEARCH.results))
    }
}

//nav is for anything connected to the history api and location
const NAV = {
    addHash(popped){
        if(popped){
            let hash=location.hash.replace('#','')
            document.querySelector('.active').classList.remove('active')
            let actor=location.hash.split('/')[0]
            let id=location.hash.split('/')[1]
            if(!actor){
                ACTORS.instructions.classList.add('active')
                
            }
            else if(!id){
                ACTORS.actors.classList.add('active')
            }
            else{
            MEDIA.showMedia()
            }
            APP.hasPopped=false
        }
        else{
                let activePage=document.querySelector('.active')
            if(activePage.id==='instructions'){
            history.pushState({}, '', `#`);
            }
            else if(activePage.id==='actors') {
                history.pushState({}, '', `#${SEARCH.searchValue.toString().toLowerCase()}`); 
            }
            else{
                history.pushState({},'', `#${SEARCH.searchValue.toString().toLowerCase()}/${MEDIA.actorId}`); 
            } 
        }
    }
}

//Start everything running

APP.init() 
