let mykey = '8538a1744a7fdaa59981232897501e04';
let searchResult = document.querySelector('.search_form'); // 검색 form을 가져옴
// 재생을 계속하기 위해 가져와서 js에서 이벤트 리스너 처리
let musicSearch = document.querySelector('#music_search'); // 검색한 값을 가져옴
let resultSection = document.querySelector('.results'); // 결과 값 출력되는 Section
let musicPlayer = document.querySelector('.music_player'); // audio tag
let widget = document.querySelector('.widgetDiv'); // audio tag 위 앨범 아트 표시되는 위젯
const maxCountOfArtists = 10; // Api 최대 값 때문에 제한

class responseObject { // json 객체를 받기위한 클래스
  constructor(id, name, albumArt, trackCount) { // 생성자
    this.id = id;
    this.name = name;
    this.albumArt = albumArt;
    this.trackCount = trackCount; // 트랙 수를 가져온다
  }
}

class trackObjectClass { // json 객체를 받기위한 클래스(track Object)
  constructor(id, albumArt, title, artist) { // 생성자
    this.id = id; // userId
    this.albumArt = albumArt;
    this.title = title; // title Name
    this.artist = artist;
  }
}

function removeChildAll(NodeObject) { // 모든 자식들을 제거하는 함수
  while (NodeObject.hasChildNodes()) {
    NodeObject.removeChild(NodeObject.firstChild);
  }
}

function resetPage() { // 원래의 페이지로 돌아가는 함수
  removeChildAll(resultSection); // 모든 자식들 제거
  let resetHTML = `<pre>
    Welcome!
    Search your favorite artist name.
    Enjoy It Thanks.
  </pre>`; // 초기화면

  resultSection.insertAdjacentHTML('beforeEnd', resetHTML);
  musicSearch.value = ""; // 검색창 리셋
}



function playMusic(currentTrackDiv) { // 음악 재생 함수
  //currentTrackDiv = artist가 가지고 있는 trackDiv를 받음
  musicPlayer.src = `${currentTrackDiv.id}?client_id=${mykey}`; // URL Request에서 src를 가져온다.
  musicPlayer.autoplay = true; // 자동 재생

  removeChildAll(widget); // 모든 자식들 제거

  let trackDiv = currentTrackDiv.cloneNode(true); // childNode 까지 복사
  widget.appendChild(trackDiv); // 위젯에 기존의 값을 포함한 노드를 붙인다.
}

searchResult.addEventListener('submit', function(event) {
  // 재생되고 있는 음악을 계속 지속되게 하기 위해 이 함수를 통해서 검색을 한다.
  event.preventDefault(); // onclick event를 가져옴
  let search = musicSearch.value; // 음악 검색 칸의 정보를 가져와서
  searchArtist(search); // 검색을 실행한다.
});

function searchArtist(artist) { // 아티스트 검색 함수
  //Fetch Api 사용
  fetch(`https://api.soundcloud.com/users/?client_id=${mykey}&q=${artist}`, {})
    .then(res => res.json())
    .then(function(json) { // api로 request를 날려 json객체를 리턴 받음
      removeChildAll(resultSection); // 섹션의 자식 삭제
      for (let i = 0; i < maxCountOfArtists; i++) { // 받은 정보만큼(Api max : 10)
        let artistObject = new responseObject(json[i].id, json[i].username,
          json[i].avatar_url, json[i].track_count); // 필요한 정보로 객체를 만든다.
        if (artistObject.trackCount == 0) { // 만약 아무 트랙도 존재하지 않으면 아티스트의 트랙 수에 No track표시
          // user이미지, user이름, user 트랙수 표시
          let artistHTML = `<div class="artist" id="${artistObject.id}">
              <img src="${artistObject.albumArt}" alt="albumArt" class="albumArt">
              <div style="font-wight : bold;">${artistObject.name}</div>
              <p>No track</p>
            </div>`;
          resultSection.insertAdjacentHTML('beforeEnd', artistHTML);
        } else { // 트랙 수를 표시
          // user이미지, user이름, user 트랙수 표시
          let artistHTML = `<div class="artist" id="${artistObject.id}">
            <img src="${artistObject.albumArt}" alt="albumArt" class="albumArt">
            <p><strong>${artistObject.name}</strong></p>
            <div>${artistObject.trackCount} tracks</div>
          </div>`;
          resultSection.insertAdjacentHTML('beforeEnd', artistHTML);
        }

      }
    })
    .then(function() {
      //위에서 만든 클래스 이름으로 배열을 가져옴
      let artistDiv = document.querySelectorAll('.artist');
      for (let i = 0; i < artistDiv.length; i++) {
        // 가져온 배열 수 만큼
        let artistID = artistDiv[i].id;
        artistDiv[i].addEventListener('click', function() { // 이벤트 리스너 추가
          updateTracks(artistID); // artist의 트랙들을 표시하는 함수 호출
        });
      }
    });
}

function updateTracks(ArtistName) { // artist의 트랙들을 표시하는 함수
  fetch(`https://api.soundcloud.com/users/${ArtistName}/tracks/?client_id=${mykey}&limit=100`)
    .then(res => res.json())
    .then(function(json) { // api로 request를 날려 json객체를 리턴 받음
      removeChildAll(resultSection); // 섹션 정보 초기화
      if (json.length === 0) { // 만약 트랙이 없으면
        resultSection.insertAdjacentHTML('beforeEnd', `<h3>No available tracks in this artist. Try again!</h3>`);
      } else {
        let tracksArray = Array();
        for (let i = 0; i < json.length; i++) { // 필요한 정보를 가지고 객체를 만들어서 배열에 push
          let trackObject = new trackObjectClass(json[i].stream_url, json[i].artwork_url,
            json[i].title, json[i].user.username);
          tracksArray.push(trackObject);
        }
        for (let i = 0; i < tracksArray.length; i++) {
          // 결과 섹션에 트랙들의 정보를 리턴한다. 이 div는 클릭 시 음악을 재생하는 함수를 호출한다.
          let trackHTML = `<div class="track" id="${tracksArray[i].id}" onclick="playMusic(this)">
                  <img src="${tracksArray[i].albumArt}" alt="No image" onerror=this.src="img/warning.png" class="trackArt">
                  <div class="trackTitle" style="font-wight : bold;">${tracksArray[i].title}</div>
                  <div class="artistName">${tracksArray[i].artist}</div>
                </div>`;

          resultSection.insertAdjacentHTML('beforeEnd', trackHTML); // 섹션에 insert
        }
      }
    });
}
