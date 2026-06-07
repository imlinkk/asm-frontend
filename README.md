# BlogSpace REST API + React SPA

Project được tách thành 2 ứng dụng riêng:

- `backend`: RESTful API dùng Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs.
- `frontend`: React 18 SPA khởi tạo theo Vite, dùng React Router v6, Axios, Tailwind CSS, Context API, React Hook Form và Zod.

## Chức năng đã triển khai:

- Auth: register, login, JWT, `/api/auth/me`, protected middleware.
- Posts: list, detail, create, update, delete, search title case-insensitive, filter category, pagination.
- Comments: list, create, delete theo quyền người viết comment hoac chủ bài viết.
- Likes: toggle like/unlike và trả về `likeCount`, `likedByMe`.
- Frontend: home, detail, login, register, create, edit, profile, admin, protected route, loading state, toast, responsive UI.

## Môi trường sử dụng

- Node.js v20+
- MongoDB local
- Postman 

## Chạy backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Cập nhật `.env` nếu cần:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/blog_assignment
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

```

API health check: `GET http://localhost:5000/api/health`

## Chạy frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend mặc định chạy tại `http://localhost:5173`.

## API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/posts?page=&limit=&search=&category=`
- `GET /api/posts/:id`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `GET /api/posts/:postId/comments`
- `POST /api/posts/:postId/comments`
- `DELETE /api/comments/:id`
- `POST /api/posts/:id/like`
- `GET /api/admin/overview`
- `GET /api/admin/posts`
- `DELETE /api/admin/posts/:id`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/role`
- `GET /api/admin/comments`
- `DELETE /api/admin/comments/:id`

## Postman

Import file `postman/BlogSpace.postman_collection.json`, sau đó chạy `Register` hoặc `Login` để collection tự lưu JWT vào biến `token`.
