'use strict'

const APP = {

    baseURL: `https://api.themoviedb.org/3/`,
    apiKEY: `8d4732ba7ba71c8428eb25ce548539f2`,
    imgBaseUrl:`https://image.tmdb.org/t/p/w154/`,
    init: () => {
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
        ev.preventDefault()
    
        /* Fetching actors info based on name typed in search bar */
        let searchValue = document.getElementById('search').value
        if(searchValue){                   
                
                let url= `${APP.baseURL}search/person?query=${searchValue}&api_key=${APP.apiKEY}`
                
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
                    ACTORS.showActors()
                })  
                .catch( (err)=>console.log( 'ERROR:', err.message)) 
        }
    }
}

//actors is for changes connected to content in the actors section
const ACTORS = {
    instructions: document.querySelector('#instructions'),
    media: document.querySelector('#media'),
    actors: document.querySelector('#actors'),

    addActive(section){
        instructions.classList.remove('active')
        media.classList.remove('active')
        actors.classList.remove('active') 
        section.classList.add('active') 
    },

    showActors(){

        /* Removing active class from instructions section and adding  to actors section */
        ACTORS.addActive(ACTORS.actors)

        let actorsHeading = document.querySelector('#actors h2')
        actorsHeading.addEventListener('click', ACTORS.showInstructions)

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
    showMedia(ev){

        window.scroll({top: 0, left: 0, behavior: 'instant'});//scroll to top

        /* Removing active class from actors section and adding  to media section */
        ACTORS.addActive(ACTORS.media)
        let mediaHeading = document.querySelector('#media h2')
        mediaHeading.addEventListener('click', ACTORS.showActors)

        /* Removing old search results */
        let mediaContent = document.querySelector('#media .content')
        mediaContent.textContent=''
        
        let id=ev.currentTarget.dataset.id
        
        let results=SEARCH.results
        results.forEach(result=>{
            if(result.id==id){
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
  //this will be used in Assign 4
}

//nav is for anything connected to the history api and location
const NAV = {
  //this will be used in Assign 4
}

//Start everything running

APP.init() 
