// .env 파일 자동 생성 스크립트
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = `DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=kanban-board-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
`;

// 기존 .env 파일 확인
if (fs.existsSync(envPath)) {
  const currentContent = fs.readFileSync(envPath, 'utf8');
  
  // MySQL 설정이 있으면 SQLite로 교체
  if (currentContent.includes('mysql://') || currentContent.includes('postgresql://')) {
    console.log('⚠️  기존 .env 파일에 MySQL/PostgreSQL 설정이 발견되었습니다.');
    console.log('🔄 SQLite 설정으로 교체합니다...');
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env 파일이 SQLite로 업데이트되었습니다!');
  } else if (currentContent.includes('file:./dev.db')) {
    console.log('✅ .env 파일이 이미 SQLite로 설정되어 있습니다.');
  } else {
    console.log('⚠️  .env 파일에 이상한 설정이 있습니다.');
    console.log('🔄 SQLite 설정으로 교체합니다...');
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env 파일이 SQLite로 업데이트되었습니다!');
  }
} else {
  // .env 파일 생성
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ .env 파일이 생성되었습니다!');
}

console.log('\n📁 위치:', envPath);
console.log('\n📝 내용:');
console.log(envContent);
console.log('\n🚀 다음 단계:');
console.log('   npx prisma db push');
console.log('   npm run prisma:seed');

