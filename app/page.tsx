import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  // 이미 로그인된 경우 보드 목록으로 리다이렉트
  if (session) {
    redirect('/boards');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            팀 협업을 위한<br />
            <span className="text-blue-600">실시간 칸반 보드</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12">
            드래그 앤 드롭으로 간편하게 작업을 관리하고,<br />
            실시간으로 팀원들과 협업하세요.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              시작하기
            </Link>
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition font-semibold border-2 border-blue-600"
            >
              로그인
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Drag & Drop</h3>
              <p className="text-gray-600">
                직관적인 드래그 앤 드롭으로 작업을 쉽게 이동하고 관리하세요.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">실시간 동기화</h3>
              <p className="text-gray-600">
                팀원들의 변경사항이 실시간으로 반영되어 항상 최신 상태를 유지합니다.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">팀 협업</h3>
              <p className="text-gray-600">
                팀원을 초대하고 작업을 할당하여 효율적으로 프로젝트를 관리하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
