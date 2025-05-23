export const logout = (req, res) => {
    res.clearCookie("access_token")
    res.clearCookie("refresh_token")
    res.json({
        message: "로그아웃 완료"
    })
}