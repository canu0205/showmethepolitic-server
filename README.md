# 리드미

# 1) 프로젝트 소개 (Introduction)

### 1.1) 개요

정치보여줘닷컴은 **유튜브 상의 다양한 정치 인터뷰와 토론 영상들을 분석하여서 각 안건별로 정치인과 전문가들의 의견을 한 눈에 보기 쉽게 모아서 보여주는 서비스**입니다. 서버를 실행하면 지정한 주기(디폴트: 24시간)마다, 유저가 명시한 플레이리스트에 새롭게 업데이트된 영상을 받아서 해당 영상에 등장한 화자들의 의견을 추출합니다. 

### 1.2) 실제 구현

**터미널**
<p align="center">
<img width="1137" alt="terminal" src="https://github.com/canu0205/showmethepolitic-server/assets/97116506/bd9c5e92-4b4b-4046-8326-092873ae7107"></p>

<p align="center">
<img width="1137" alt="정치보여줘닷컴(CLI)" src="https://github.com/canu0205/showmethepolitic-server/assets/97116506/1e3d5e47-7526-495e-b26c-88890ec90968">
</p>

**PoC 웹사이트**

<p align="center">
<img width="1137" alt="정치보여줘닷컴" src="https://github.com/canu0205/showmethepolitic-server/assets/97116506/8cdd312a-4192-4b34-8fd3-84e649ef0b9e">
</p>


# 2) 사용 방법 (User guide)

### 2.1) 사전 요구사항

**2.1.1) 클로바**

*아래 API를 사용하기 위해선, 먼저 네이버 클라우드 플랫폼 콘솔에서 ‘Object Storage’와 ‘CLOVA Speech’ 서비스를 신청하여야 합니다.* 

- **하이퍼 클로바의 [Object Storage API](https://api.ncloud-docs.com/docs/storage-objectstorage)** : 네이버 클라우드 플랫폼의 스토리지 관리 및 사용에 필요한 API입니다.
- **하이퍼클로바의 [CLOVA Speech API](https://blog.naver.com/n_cloudplatform/223331954000)** : 변환한 영상을 텍스트로 변환하는데 사용하는 API입니다.

**2.1.2) 버켓 이름 설정**

- 하이퍼클로바의 Object Storage 서비스의 Bucket Management에서 생성한 버켓의 이름을 `env` 파일의 `BUCKET_NAME` 변수에 할당합니다. 예를 들어 아래 예시에서는 `BUCKET_NAME = videoinput3` 입니다.

<p align="center">
<img width="724" alt="Bucker Management" src="https://github.com/canu0205/showmethepolitic-server/assets/97116506/297cc1b9-bf1f-4106-88f1-7bb16e9ca89a"></p>


**2.1.3) 유튜브 API**

- 구글의 **[YouTube Data API](https://developers.google.com/youtube/v3) :** 최근 24시간 내에 리스팅한 플레이리스트에서 새롭게 업데이트된 영상 URL을 받아오는데 사용하는 API입니다.

**2.1.4) GPT API** 

- OpenAI의 [GPT4 API](https://openai.com/blog/gpt-4-api-general-availability) : 변환한 텍스트에서 각 화자들의 의견을 요약해서 추출하는데 사용하는 API입니다. 본 프로젝트에선 `gpt-4-1106-preview` 모델을 사용하였습니다.

### 2.2) 설치 방법

본 프로젝트의 repository를 `git clone` 하여 로컬에 저장 후, 프로젝트 디렉토리 내에서 `npm install` 커맨드를 통해 설치할 수 있습니다.  

### 2.3) 실행 방법

**2.3.1) 플레이리스트 생성**

Youtube에서 플레이리스트를 생성합니다. 이때, 아래 사진에 보이는 플레이리스트 링크의 뒷 부분을 `scheduler.js`의 `whitelistedPlaylists` 에 추가합니다.

<p align="center">
<img width="949" alt="Playlist" src="https://github.com/canu0205/showmethepolitic-server/assets/97116506/36b91327-d30f-4bcd-90fc-f22fe522657c"></p>

**2.3.2) 플레이리스트 추가**

요약을 원하는 영상을 플레이리스트에 추가합니다.

**2.3.3) 실행**

`npm run start` 커맨드를 통해 영상의 요약본을 추출할 수 있습니다. 플레이리스트 내에 리스팅된 영상의 변화가 없을 경우  추가로 요약을 원하는 영상이 있을 경우 플레이리스트에 추가할 경우 추가적인 요약본이 추출되지 않습니다. 실행 후 플레이리스트에 영상을 추가할 경우 요약본이 추가로 추출됩니다. 

프로젝트 실행 후엔 `last_processed_urls.json` 파일이 생성됩니다. 실행 후 초기화를 위해선 해당 파일을 삭제 후 재실행 해야 합니다.

# 3. 구조 (Architecutre)

<p align="center">
  <img width="949" alt="Playlist" src="https://github.com/canu0205/showmethepolitic-server/assets/97116506/78d43f10-8ae9-4015-9015-fc7575d3c89a"></p>
</p>


### 3.1) 파일 설명

| Filename | Description |
| --- | --- |
| bucket.controller.js | Object Storage API를 통해서 스토리지 관리 및 사용 |
| clova.controller.js | CLOVA Spech API를 통해서 mp3 파일을 텍스트 전문으로 변환 |
| extract.js | GPT-4 API를 이용하여서 텍스트 전문에서 원하는 형식의 결과값 추출  |
| fetchVideos.js | 플레이리스트에 새롭게 추가된 영상의 URL 추출 |
| scheduler.js | 24시간마다 플레이리스트에 새롭게 업데이트되는 영상을 처리 |
| testFetchVideos.js | fetchVideo가 제대로 작동하는지 확인 |
| youtubeToMp3.js | 유튜브 URL을 통해서 영상을 mp3로 변환 |

### 3.2) DB Schema

<p align="center">
<img width="511" alt="Screenshot 2024-02-10 at 12 29 02 AM" src="https://github.com/canu0205/showmethepolitic-server/assets/97116506/81ab3827-1bd1-471b-acfb-a73efb37694e">
</p>

# 4) 팀원 정보 (Member Information)

### 4.1) [은성준](https://maily.so/flavor/about)

프로젝트 기획 및 API 워크플로우 정립

### 4.2) [박찬우](https://canu.blog/)

프론트엔드 및 백엔드 개발

### 4.3) [이수찬](https://linktr.ee/isuchan0212)

프로젝트 기획 및 GPT 프롬프팅
