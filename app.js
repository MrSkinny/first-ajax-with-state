// State object
const appState = {
    videos: []
};

/**
 * Asyncronously call Youtube API and invoke callback when response received, 
 * sending in a `videos` array of objects with following properties:
 * title (string), thumbnails (array), channelTitle (string), videoId (string)
 *  
 * @param {string}   searchTerm
 * @param {function} callback
 */
function fetchVideos(searchTerm, callback){
    const BASE_API = 'https://www.googleapis.com/youtube/v3/search';
    const YOUTUBE_KEY = 'YOUR_KEY_HERE';

    const query = {
        part: 'snippet',
        key: YOUTUBE_KEY,
        q: searchTerm
    };

    $.ajax({
        method: 'GET',
        url: BASE_API,
        data: query,
        success: response => {
            // from the large API response, we want to create a `videos` array of "decorated objects" 
            // - objects that only contain the information we want for our rendering function
            const videos = response.items.map(item => {
                const { title, thumbnails, channelTitle } = item.snippet;
                const { videoId } = item.id;
                return { 
                    title, thumbnails, channelTitle, 
                    videoUrl: videoId ? `https://youtube.com/watch?v=${videoId}` : null
                };
            });

            // send the `videos` array back into the callback function
            callback(videos);
        }
    });
}

// State modification functions
function setVideos(state, videos) {
    state.videos = videos;
}

// Rendering functions
function renderList(state) {
    const elements = $(state.videos.map(createListItem).join(''));
    $('.results').html(elements);
}

// Event Listeners
function initEventListeners(){

    // Form submit listener
    $('form').submit(e => {
        e.preventDefault();
        const searchInput = $('#search-term');
        const searchTerm = searchInput.val();
        fetchVideos(searchTerm, videos => {
            setVideos(appState, videos);
            renderList(appState);
            searchInput.val('');
        });
    });
}

/**
 * Takes in decorated video object and returns HTML snippet
 * @param   {Object} video - should contain title, thumbnails, channelTitle, videoUrl properties 
 * @returns {String}       - HTML ready for DOM 
 */
function createListItem(video) {
    const { title, thumbnails, channelTitle, videoUrl } = video;
    return `
        <a target="_blank" class="list-item" href="${videoUrl || '#'}">
            <li>
                <div class="col col-left">
                    <img src="${thumbnails.medium.url}" />
                </div>
                <div class="col col-right">
                    <p>
                        <span class="heading">${title}</span><br />
                        <span class="author">by ${channelTitle}</span>
                    </p>
                </div>
            </li>
        </a>
    `;
}

// When DOM is ready:
$(function() {
    initEventListeners();
    renderList(appState);
});
