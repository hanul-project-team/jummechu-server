// middlewares/authMiddleware.js (protect 함수)
import jwt from 'jsonwebtoken';
import User from '../models/user.js'; // User 모델 경로에 맞게 수정

export const protect = async (req, res, next) => {
  let token;

  // 1. 요청 헤더 대신 쿠키에서 토큰을 찾습니다.
  // req.cookies 객체를 사용하려면 'cookie-parser' 미들웨어가 Express 앱에 등록되어 있어야 합니다.
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  // 토큰이 없으면 401 Unauthorized 반환
  if (!token) {
    console.log('토큰이 쿠키에 없습니다.'); // 디버깅용 로그
    return res.status(401).json({ message: '인증되지 않았습니다: 토큰이 없습니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    // console.log('토큰 디코딩 성공:', decoded); // 디버깅용 로그 (email이 보일 것)
  
    // 이메일로 사용자를 찾습니다.
    req.user = await User.findOne({ email: decoded.email }).select('-password');
  
    if (!req.user) {
      console.log('Protect Middleware: 인증 실패 - 사용자 정보를 찾을 수 없습니다.');
      return res.status(401).json({ message: '인증 실패: 사용자 정보를 찾을 수 없습니다.' });
    }
    next();
  } catch (error) {
    console.error('토큰 인증 오류:', error); // 어떤 에러인지 정확히 로그로 남깁니다.
    // 토큰 만료 등 유효하지 않은 토큰 처리
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '토큰이 만료되었습니다. 다시 로그인해주세요.' });
    }
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};