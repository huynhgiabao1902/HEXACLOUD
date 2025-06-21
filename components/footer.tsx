import Link from "next/link"
import { Cloud, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo và mô tả */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Cloud className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">HexaCloud</span>
            </div>
            <p className="text-gray-400 mb-4">
              Nền tảng quản lý đám mây hàng đầu, cung cấp giải pháp toàn diện cho doanh nghiệp hiện đại.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail className="h-4 w-4" />
                <span>contact@hexacloud.com</span>
              </div>
            </div>
          </div>

          {/* Dịch vụ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/services/storage" className="hover:text-white transition-colors">
                  Cloud Storage
                </Link>
              </li>
              <li>
                <Link href="/services/compute" className="hover:text-white transition-colors">
                  Cloud Compute
                </Link>
              </li>
              <li>
                <Link href="/services/database" className="hover:text-white transition-colors">
                  Database
                </Link>
              </li>
              <li>
                <Link href="/services/security" className="hover:text-white transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Trung tâm hỗ trợ
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-white transition-colors">
                  Tài liệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-white transition-colors">
                  Trạng thái hệ thống
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 HexaCloud. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
