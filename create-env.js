/**
 * .env 파일 자동 생성 스크립트
 * SQLite 데이터베이스를 위한 환경 변수를 생성합니다.
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

// 환경 변수 내용 (따옴표 없이!)
const envContent = `DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=kanban-board-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
`;

try {
  // 기존 .env 파일 확인
  if (fs.existsSync(envPath)) {
    const currentContent = fs.readFileSync(envPath, 'utf8');
    
    // SQLite 설정이 이미 있는지 확인
    if (currentContent.includes('file:./dev.db') && 
        currentContent.includes('NEXTAUTH_SECRET') && 
        currentContent.includes('NEXTAUTH_URL')) {
      console.log('✅ .env 파일이 이미 올바르게 설정되어 있습니다.');
      console.log('📁 위치:', envPath);
      return;
    }
    
    // MySQL/PostgreSQL 설정이 있으면 경고
    if (currentContent.includes('mysql://') || currentContent.includes('postgresql://')) {
      console.log('⚠️  MySQL/PostgreSQL 설정이 발견되었습니다.');
      console.log('🔄 SQLite 설정으로 교체합니다...\n');
    } else {
      console.log('⚠️  .env 파일을 업데이트합니다...\n');
    }
    
    // 파일 덮어쓰기
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env 파일이 업데이트되었습니다!');
  } else {
    // 새로 생성
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env 파일이 생성되었습니다!');
  }
  
  console.log('📁 위치:', envPath);
  console.log('\n📝 내용:');
  console.log(envContent);
  console.log('✨ 환경 변수 설정 완료!\n');
  
} catch (error) {
  console.error('❌ .env 파일 생성 중 오류 발생:', error.message);
  console.log('\n📝 수동으로 .env 파일을 생성해주세요:');
  console.log('파일명: .env');
  console.log('위치: 프로젝트 루트');
  console.log('\n내용:');
  console.log(envContent);
  process.exit(1);
}

