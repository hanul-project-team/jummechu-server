# 점메추(Jummechu) - 맛집 검색 및 사용자 맞춤 추천 사이트

## 링크모음
- **서버 주소**: [https://jummechu.ddnsfree.com](https://jummechu.ddnsfree.com)
- **클라이언트 GitHub**: [https://github.com/hanul-project-team/jummechu-client](https://github.com/hanul-project-team/jummechu-client)
- **서버 GitHub**: [https://github.com/hanul-project-team/jummechu-server](https://github.com/hanul-project-team/jummechu-server)
- **Static 이미지 다운로드**: [https://drive.google.com/file/d/1_f7uvEnh8i-GiPJpguup5j8Fpptfa2_X/view?usp=drive_link](https://drive.google.com/file/d/1_f7uvEnh8i-GiPJpguup5j8Fpptfa2_X/view?usp=drive_link)
<br><br>

## 기술스택
### Backend
- **Express 5**: 최신 Node.js 웹 프레임워크
- **MongoDB + Mongoose**: NoSQL 기반 데이터베이스 및 ODM 라이브러리
- **dotenv**: 환경변수 관리를 위한 모듈
- **cookie-parser**: 요청 쿠키를 파싱하기 위한 미들웨어
- **cors**: Cross-Origin 요청 허용을 위한 설정 미들웨어
- **multer**: 멀티파트 폼 데이터(예: 이미지, 파일 업로드) 처리를 위한 미들웨어


### 인증 & 보안
- **jsonwebtoken (JWT)**: 사용자 인증을 위한 토큰 발급 및 검증
- **bcrypt**: 비밀번호 해싱 및 비교를 위한 암호화 라이브러리
- **google-auth-library**: 구글 OAuth 인증 처리를 위한 라이브러리
- **crypto**: 내장 암호화 모듈을 활용한 보안 처리

### API 통신
- **Axios**: 외부 API 연동 시 HTTP 요청을 처리하는 클라이언트 라이브러리

### AI 연동
- **@azure/openai**: Azure OpenAI API를 통해 AI 추천 기능 구현
<br><br>

## 폴더구조
```bash
jummechu-server/
│
├── config/                 # 데이터베이스 연결 설정
├── controllers/            # 요청 로직 처리
├── middlewares/            # Middleware 설정 파일 
├── models/                 # MongoDB 모델 스키마 정의
├── node_modules/
├── routes/                 # API 라우터 정의 (기능별로 요청 경로와 컨트롤러 연결)
├── service/                # 비즈니스 로직 처리용 함수 모음 폴더
├── static/                 # 정적 파일 제공용 폴더
├── uploads/                # 사용자 업로드 파일 저장 폴더
├── .env
├── .gitignore
├── index.js                # Express 서버 설정 및 미들웨어 구성
├── package.json
├── README.md
├── server.js               # 서버 실행 시작점
└── yarn.lock
```
<br><br>

## 환경변수 설정
```bash
.env
ACCESS_SECRET_KEY=your-access-token-secret-key 
AZURE_OPENAI_API_ENDPOINT=your-azure-openai-api-endpoint
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_DALLE_DEPLOYMENT_NAME=dall-e-3
AZURE_OPENAI_DEPLOYMENT=gpt-4.1
CORS_ORIGIN=http://localhost:5173
DB_URI=mongodb+srv://<db_id>:<db_password>@cluster0.mm9wmkv.mongodb.net/jummechu
GOOGLE_CLIENT_ID=your-google-client-id
KAKAO_KEY=your-kakao-key
KAKAO_REDIRECT_URI='http://localhost:5173/kakao_callback'
NHN_API_SECRET_KEY=your-nhn-api-secret-key
NHN_APP_SECRET_KEY=your-nhn-app-secret-key
NHN_RESET_PASSWORD_TEMPLATE=your-nhn-reset-password-template
PORT=3000
REFRESH_SECRET_KEY=your-refresh-token-secret-key
RESET_SECRET_KEY=your-reset-token-secret-key
SMS_VERIFY_KEY=your-sms-verification-secret-key
SOLAPI_API_PUBLIC_KEY=your-solapi-api-public-key
SOLAPI_API_SECRET_KEY=your-solapi-api-secret-key
SOLAPI_PHONE_NUMBER=your-phone-number
```
<br><br>

## 주요 기능
- **회원 관리**: 회원가입, 로그인/로그아웃, 소셜 로그인, 아이디/비밀번호 찾기, 비밀번호 재설정, 계정 설정
- **북마크 관리**: 북마크 저장, 삭제, 조회
- **리뷰 관리**: 리뷰 작성, 수정, 삭제, 조회, 파일 업로드
- **상점 정보 관리**: 상점 정보 저장, 수정, 조회, 태그 기반 매칭
<br><br>

## API 명세
### /auth (AuthRouter)
| Method | Endpoint                     | 설명                                 |
|--------|------------------------------|--------------------------------------|
| PUT    | /auth/account_setting/:id    | 소셜 간편가입 계정설정 요청           |
| POST   | /auth/find_account           | 아이디 찾기 요청                     |
| POST   | /auth/google_verify          | 구글 간편 로그인 인증 요청           |
| POST   | /auth/kakao_verify           | 카카오 간편 로그인 인증 요청           |
| GET    | /auth/logout                 | 로그아웃 요청                        |
| POST   | /auth/login                  | 로그인 요청                          |
| POST   | /auth/regist                 | 회원가입 요청                        |
| GET    | /auth/restore_login          | 로그인 상태 복구 (토큰으로 확인)     |
| PUT    | /auth/reset_password         | 비밀번호 재설정 요청                 |
| POST   | /auth/send_code              | 인증 코드 전송 요청                  |
| POST   | /auth/send_link              | 비밀번호 재설정 링크 전송 요청       |
| POST   | /auth/target                 | 비밀번호 재설정 계정 확인 요청       |
| POST   | /auth/verify_code            | 인증 코드 확인 요청                  |
| POST   | /auth/verify_reset_token     | 비밀번호 재설정 토큰 확인 요청       |

### /bookmark (BookmarkRouter)
| Method | Endpoint                     | 설명                          |
|--------|------------------------------|-------------------------------|
| DELETE | /bookmark/delete/:id         | 북마크 삭제                  |
| GET    | /bookmark/read/:id           | 특정 유저의 북마크 조회      |
| POST   | /bookmark/regist/:id         | 북마크 저장                  |


### /review (ReviewRouter)
| Method | Endpoint                         | 설명                             |
|--------|----------------------------------|----------------------------------|
| DELETE | /review/delete/:id               | 리뷰 삭제                        |
| GET    | /review/read/store/:id           | 특정 가게의 리뷰 조회            |
| GET    | /review/read/user/:id            | 특정 유저가 작성한 리뷰 조회     |
| POST   | /review/readall                  | 모든 리뷰 조회                  |
| POST   | /review/regist                   | 리뷰 등록 (파일 업로드 포함)     |
| PUT    | /review/:id                      | 리뷰 수정                        |

### /store (StoreRouter)
| Method | Endpoint                         | 설명                             |
|--------|----------------------------------|----------------------------------|
| POST   | /store/save                      | 상점 정보 저장                   |
| GET    | /store/read/:id                  | 상세 페이지 상점 정보 갱신 요청  |
| POST   | /store/storeInfo                 | 상점 상세 정보 불러오기          |
| POST   | /store/tag/match                 | 주변 지역 상점정보 요청           |