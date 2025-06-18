# 점메추(Jummechu) - 맛집 검색 및 사용자 맞춤 추천 사이트

## 기술스택
### Backend
- **Express 5**: 최신 Node.js 웹 프레임워크
- **MongoDB + Mongoose**: NoSQL 기반 데이터베이스 및 ODM 라이브러리
- **dotenv**: 환경변수 관리를 위한 모듈
- **cookie-parser**: 요청 쿠키를 파싱하기 위한 미들웨어
- **cors**: Cross-Origin 요청 허용을 위한 설정 미들웨어

### 인증 & 보안
- **jsonwebtoken (JWT)**: 사용자 인증을 위한 토큰 발급 및 검증
- **bcrypt**: 비밀번호 해싱 및 비교를 위한 암호화 라이브러리
- **google-auth-library**: 구글 OAuth 인증 처리를 위한 라이브러리
- **crypto**: 내장 암호화 모듈을 활용한 보안 처리

### API 통신
- **Axios**: 외부 API 연동 시 HTTP 요청을 처리하는 클라이언트 라이브러리

### AI 연동
- **@azure/openai**: Azure OpenAI API를 통해 AI 추천 기능 구현

## 폴더구조
```bash
jummechu-server/
│
├── config/                 # 데이터베이스 연결 설정
├── controllers/            # 요청 로직 처리
├── models/                 # MongoDB 모델 스키마 정의
├── node_modules/
├── routes/                 # API 라우터 정의 (기능별로 요청 경로와 컨트롤러 연결)
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

## GitHub 및 서비스 주소
- **클라이언트 GitHub**: [https://github.com/hanul-project-team/jummechu-client](https://github.com/hanul-project-team/jummechu-client)
- **서버 GitHub**: [https://github.com/hanul-project-team/jummechu-server](https://github.com/hanul-project-team/jummechu-server)
