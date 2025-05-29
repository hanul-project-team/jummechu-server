# 점메추(Jummechu) - 점심 뿐 아니라 아침, 저녁, 야식까지 추천해주는 맛집 검색 사이트

## 기술스택

## 폴더구조

```bash
jummechu-server/
│
├── config/                 # 데이터베이스 연결 설정
├── controllers/            # 요청 로직 처리
├── models/                 # 데이터베이스 모델 스키마
├── node_modules/
├── routes/                 # API 라우팅
├── .env
├── .gitignore
├── index.js                # Express 서버 설정
├── package.json
├── README.md
├── server.js               # 서버 실행
└── yarn.lock
```

## 실행방법

1. 프로젝트 클론
   ```bash
   git clone https://github.com/hanul-project-team/jummechu-server.git
   cd jummechu-server
   ```
2. 패키지 설치
   ```bash
   yarn
   ```
3. .env파일 생성 및 환경변수 설정

   ```env
   DB_URI = 'mongodb+srv://admin:admin1234@cluster0.mm9wmkv.mongodb.net/jummechu'
   ACCESS_SECRET_KEY = 'access'
   REFRESH_SECRET_KEY = 'refresh'
   RESET_SECRET_KEY = 'reset'
   SMS_VERIFY_KEY = 'verify'
   SOLAPI_API_SECRET = 'ILY2BWBNEGMIAEHBWH7EHEY4UUZTR2Z8'
   SOLAPI_API_KEY = 'NCSQOO6OIHZXY8JG'
   SOLAPI_SENDER = '01090242352'
   API_KEY = AIzaSyCOuC8VMrObyMzES4vfMr-2urbDrNMydTY
   KAKAO_KEY = 37188c706645c703ed7ee46eea04b377
   AZURE_OPENAI_ENDPOINT=https://sehwa-makipzh3-swedencentral.cognitiveservices.azure.com
   AZURE_OPENAI_API_KEY=3a1oqVonav1jdyEWphUnKUBS2VSZJpgXVI0Ucotx1q9zwB6FxSsWJQQJ99BEACfhMk5XJ3w3AAAAACOGHsJq
   AZURE_OPENAI_DEPLOYMENT=gpt-4.1
   AZURE_OPENAI_DALLE_DEPLOYMENT_NAME=dall-e-3
   AZURE_OPENAI_API_VERSION=2025-01-01-preview
   ```

4. 서버 실행
   ```bash
   yarn run dev
   ```
