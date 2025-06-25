// controllers/auth/verifyPassword.js
import bcrypt from 'bcrypt';
import User from '../../models/user.js'; // user.js 소문자 확인

export const verifyPassword = async (req, res, next) => {
    
    
    try {
        const { password: enteredPassword } = req.body; // 프론트에서 보낸 비밀번호만 가져옴

        // protect 미들웨어를 통해 인증된 사용자의 정보가 req.user에 담겨있다고 가정
        // protect 미들웨어에서 req.user에 사용자 정보를 할당하고 있습니다.
        const currentUser = req.user; 

        // 현재 로그인된 사용자 정보가 없는 경우 (protect 미들웨어에서 걸러져야 하지만, 혹시 모를 상황 대비)
        if (!currentUser) {
            return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
        }

        // 1. 데이터베이스에서 현재 로그인된 사용자 찾기 (req.user에 이미 사용자 객체가 있을 것이므로, 다시 findOne 할 필요는 없을 수도 있지만,
        // 확실한 비교를 위해 DB에서 다시 가져오는 것도 가능합니다. protect에서 -password를 select했으니, 여기서는 다시 가져오는 게 맞습니다)
        // 이 부분은 protect 미들웨어에서 User.findOne({ email: decoded.email }).select('-password'); 로 비밀번호를 제외했기 때문에
        // 다시 User.findById(currentUser._id) 등으로 가져와서 비밀번호를 포함시켜야 합니다.
        // 또는 protect에서 select('-password')를 제거하면 이 부분은 생략 가능합니다.
        
        // protect 미들웨어의 User.findOne({ email: decoded.email }).select('-password'); 이 부분 때문에
        // req.user 객체에는 password 필드가 없습니다. 따라서 DB에서 다시 가져와야 합니다.
        const userWithPassword = await User.findById(currentUser._id); // ID로 사용자를 찾고, 비밀번호 정보도 함께 가져옴

        if (!userWithPassword) {
            // 이 경우는 거의 없겠지만, 만약 DB에서 사용자가 삭제되었거나 ID가 잘못된 경우
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }

        // 2. 입력된 비밀번호와 DB의 비밀번호 비교
        const isMatch = await bcrypt.compare(enteredPassword, userWithPassword.password);

        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        // 비밀번호가 일치하면 다음 미들웨어 또는 컨트롤러로 이동
        // 여기서는 인증만 확인하는 것이므로, 다음 미들웨어가 필요 없으면 res.status(200) 응답을 바로 보냅니다.
        // 만약 next()로 가서 추가적인 처리를 한다면 next()를 유지하세요.
        // 하지만 MypagesAuthForm.jsx에서 response.data.success를 체크하는 것을 보면,
        // 여기서 성공 응답을 보내는 것이 더 자연스럽습니다.
        return res.status(200).json({ success: true, message: '비밀번호 인증에 성공했습니다.' });

    } catch (error) {
        console.error('비밀번호 인증 오류:', error);
        res.status(500).json({ message: '서버 오류 발생' });
    }
};