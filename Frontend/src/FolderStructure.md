src
│
├── app
│ ├── store.ts
│ ├── hooks.ts
│ └── providers.tsx
│
├── routes
│ ├── router.tsx
│ └── route-types.ts
│
├── pages
│ ├── home
│ │ ├── HomePage.tsx
│ │ └── index.ts
│ │
│ └── dashboard
│ ├── DashboardPage.tsx
│ └── index.ts
│
├── features
│ ├── auth
│ │ ├── api
│ │ │ └── authApi.ts
│ │ │
│ │ ├── store
│ │ │ ├── authSlice.ts
│ │ │ └── selectors.ts
│ │ │
│ │ ├── components
│ │ │ └── LoginForm.tsx
│ │ │
│ │ ├── hooks
│ │ │ └── useAuth.ts
│ │ │
│ │ └── types.ts
│ │
│ └── users
│ ├── api
│ │ └── usersApi.ts
│ │
│ ├── store
│ │ ├── usersSlice.ts
│ │ └── selectors.ts
│ │
│ ├── components
│ │ └── UsersTable.tsx
│ │
│ └── types.ts
│
├── services
│ ├── api
│ │ ├── axiosClient.ts
│ │ ├── apiTypes.ts
│ │ └── interceptors.ts
│ │
│ └── socket
│ ├── socketClient.ts
│ └── socketEvents.ts
│
├── components
│ ├── ui
│ │ ├── Button.tsx
│ │ ├── Modal.tsx
│ │ └── Input.tsx
│ │
│ └── layout
│ ├── Header.tsx
│ ├── Sidebar.tsx
│ └── Layout.tsx
│
├── hooks
│ ├── useDebounce.ts
│ ├── useToggle.ts
│ └── useSocket.ts
│
├── utils
│ ├── date.ts
│ ├── storage.ts
│ └── cn.ts
│
├── constants
│ ├── routes.ts
│ └── appConfig.ts
│
├── styles
│ ├── globals.css
│ └── tailwind.css
│
├── types
│ ├── api.ts
│ └── global.ts
│
├── assets
│ ├── images
│ └── icons
│
├── main.tsx
└── App.tsx
