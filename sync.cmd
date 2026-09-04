@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  혁신의숲 FAQ - 공개 사이트 반영
echo  ================================
echo.

if not exist "data.json" (
  echo  [오류] data.json 이 없습니다.
  echo         관리자 화면에서 "내용 내려받기" 로 받은 파일을
  echo         이 폴더에 data.json 이라는 이름으로 넣어주세요.
  echo.
  pause
  exit /b 1
)

echo  [1/3] 페이지 만드는 중...
call node build.js
if errorlevel 1 (
  echo  [오류] 빌드에 실패했습니다.
  pause
  exit /b 1
)

echo.
echo  [2/3] 변경 내용 기록 중...
git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo  변경된 내용이 없습니다. 이미 최신 상태입니다.
  echo.
  pause
  exit /b 0
)
git commit -m "FAQ 내용 갱신" >nul
if errorlevel 1 (
  echo  [오류] 기록에 실패했습니다.
  pause
  exit /b 1
)

echo.
echo  [3/3] 공개 사이트에 올리는 중...
git push
if errorlevel 1 (
  echo  [오류] 올리기에 실패했습니다. 인터넷 연결이나 깃허브 로그인을 확인해주세요.
  pause
  exit /b 1
)

echo.
echo  완료되었습니다.
echo  1~2분 뒤 공개 사이트에 반영됩니다.
echo.
pause
