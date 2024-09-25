# Futsal_Game_Simulater

### 0. DB_Diagram

![Untitled (1)](https://github.com/user-attachments/assets/ce633eef-dcfc-4e83-8ff0-872ef0f6a5fb)

---

### 1. 프로젝트 구성

---

1. /

- app: 메인서버 실행 파일

---

2. /middlewares/

- auth.middleware: 토큰 인증 관리

- login.Auth.middleware: 로그인 시 토큰 관리

---

3. /routes/

- characters.router: 선수정보 조회

- gameStart.router: 게임 실행

- inventory.router: 인벤토리 관리

- pickup.router: 뽑기

- ranking.router: 랭킹관리

- squad.router: 선수 선발

- upgrade.router: 선수 강화

- users.router: 회원가입, 로그인(토큰 발급)

---

4. /utils/

- index: prisma 작동 및 작동 시 콘솔에 찍힐 로그를 설정

- time, token: users.router에 사용될 함수 모음

- transaction: 트랜잭션을 함수로 만들어 사용

---

5. /http/

- Main.html: 로그인 하면 들어와질 메인 화면

- Signin.html: 로그인 화면

- Signup.html: 회원가입 화면

- styles.css: html 스타일 관리

---

6. /http/js

- main.js: 메인 화면 실행 로직

- utils.js: main.js에서 사용 될 함수모음

---

### 2. 프로젝트 사용법

---

0. app.js

- 로그인 화면: '/Signin'

- 회원가입 화면: '/Signup'

- 메인 화면: '/Main'

- api: '/FutsalGame'

---

1. characters.router:

- DB 선수 전체 정보 조회: '/Character/CheckAll'

- DB 특정 선수 정보 조회: '/Character/OneCheck/:characterDBId'

---

2. gameStart.router:

- 상대 지정 게임: '/Play/:target'

- 레이팅 게임: '/Rating/Play'

---

3. inventory.router:

- 나의 계정에 있는 CharacterDB(보유 선수 목록) 조회: '/Inventory/Check'

- 타 계정에 있는 CharacterDB(보유 선수 목록) 조회: '/Inventory/Check/:userId'

---

4. pickup.router:

- 캐시 구매: '/Cash'

- 캐시 뽑기 (선수 영입): '/Pick-up'

- 캐시 뽑기 11연뽑: '/Pick-up/All-at-once'

---

5. ranking.router:

- 현재 모든 랭킹 확인: '/Ranking/AllCheck'

- 특정 유저 랭킹 확인: '/Ranking/SingleCheck/:userId'

---

6. squad.router:

- 선수 선발||해제: '/Squad/in-out/:inventoryId'

- 선수 전체 해제: '/Squad/All-Out'

- 현재 스쿼드 확인: '/Squad/Check'

---

6. upgrade.router:

- 선수 강화: '/Upgrade/:inventoryId'

---

7. users.router:

- 회원가입: '/Sign-Up'

- 로그인: '/Sign-In'

---

### 3. 추가된 사항

- 서버에서 일정 주기로 랭크를 업데이트.

- 게임 실행에서 선수들 능력치로 인한 다양한 확률로 골이 나올 수 있고 안나올 수 있다.

- 게임 실행 시 로그를 일정 간격으로 띄움으로 생동감 있는 중계를 연출해보았다.
