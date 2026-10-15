--
-- PostgreSQL database dump
--

-- \restrict pggnkTWL8j8aFnJMnhYqKxXE9uUn0CDR9r8GEmrOm2eRIaqrV6NYJ7DIhfK4dF5

-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AttendanceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AttendanceStatus" AS ENUM (
    'PRESENT',
    'ABSENT',
    'LATE'
);


--
-- Name: FeeStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FeeStatus" AS ENUM (
    'PAID',
    'PENDING',
    'OVERDUE'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'BKASH',
    'NAGAD',
    'CASH',
    'BANK_TRANSFER'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'OWNER',
    'TEACHER',
    'STUDENT',
    'PARENT'
);


--
-- Name: StudentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StudentStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    provider_account_id text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id text NOT NULL,
    institute_id text NOT NULL,
    user_id text,
    action text NOT NULL,
    details text,
    ip_address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- Name: attendances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendances (
    id text NOT NULL,
    institute_id text NOT NULL,
    student_id text NOT NULL,
    batch_id text NOT NULL,
    date date NOT NULL,
    status public."AttendanceStatus" DEFAULT 'PRESENT'::public."AttendanceStatus" NOT NULL,
    notes text,
    marked_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.batches (
    id text NOT NULL,
    institute_id text NOT NULL,
    teacher_id text,
    name text NOT NULL,
    subject text,
    schedule text,
    monthly_fee numeric(10,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id text NOT NULL,
    institute_id text NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    amount numeric(10,2) NOT NULL,
    expense_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    recorded_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: fees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fees (
    id text NOT NULL,
    institute_id text NOT NULL,
    student_id text NOT NULL,
    receipt_no text NOT NULL,
    amount numeric(10,2) NOT NULL,
    month_year text NOT NULL,
    status public."FeeStatus" DEFAULT 'PENDING'::public."FeeStatus" NOT NULL,
    payment_method public."PaymentMethod",
    transaction_id text,
    payment_date timestamp(3) without time zone,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: institutes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutes (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    phone text,
    email text,
    address text,
    logo_url text,
    subdomain text,
    currency text DEFAULT 'BDT'::text,
    timezone text DEFAULT 'Asia/Dhaka'::text,
    default_language text DEFAULT 'en'::text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.results (
    id text NOT NULL,
    institute_id text NOT NULL,
    student_id text NOT NULL,
    batch_id text NOT NULL,
    exam_name text NOT NULL,
    subject text NOT NULL,
    marks_obtained numeric(5,2) NOT NULL,
    total_marks numeric(5,2) DEFAULT 100.00 NOT NULL,
    grade text,
    exam_date timestamp(3) without time zone,
    comments text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    session_token text NOT NULL,
    user_id text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: student_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_batches (
    id text NOT NULL,
    institute_id text NOT NULL,
    student_id text NOT NULL,
    batch_id text NOT NULL,
    enrolled_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id text NOT NULL,
    institute_id text NOT NULL,
    user_id text,
    roll_no text NOT NULL,
    full_name text NOT NULL,
    email text,
    gender text,
    blood_group text,
    date_of_birth timestamp(3) without time zone,
    guardian_name text,
    guardian_phone text,
    address text,
    photo_url text,
    status public."StudentStatus" DEFAULT 'ACTIVE'::public."StudentStatus" NOT NULL,
    admission_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teachers (
    id text NOT NULL,
    institute_id text NOT NULL,
    user_id text NOT NULL,
    subject text NOT NULL,
    phone text,
    joining_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    institute_id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text,
    role public."Role" DEFAULT 'STUDENT'::public."Role" NOT NULL,
    avatar_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, institute_id, user_id, action, details, ip_address, created_at) FROM stdin;
2deb1606358d4505886ac97bf9d6193a	inst_a	user_a	STUDENT_ASSIGNED_BATCH	Student Student A assigned to batch Batch A	\N	2026-09-03 12:41:41.595
987ab6af4a2841e18520b2abd690b97d	inst_a	user_a	STUDENT_UPDATED	Student record updated for 'Updated Name' (Roll: A001)	\N	2026-09-03 12:42:04.764
dd4bd3d9e0e64e2ca1d95cc1482481ba	inst_a	user_a	STUDENT_DELETED	Archived/Suspended student record: Updated Name (Roll: A001)	\N	2026-09-03 12:42:04.781
82170d966c7847139830b28d3a156062	inst_a	user_a	Default language updated to বাংলা		\N	2026-09-03 12:42:33.819
d9c57fd017134b2286fb9ef70261fcc9	cmsx108210000rl1u0wh8q33z	cmsx108250002rl1u5p7w1dh1	Institute profile updated: Ideal Coaching Center (Dhaka Branch)		\N	2026-09-04 10:19:42.446
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alembic_version (version_num) FROM stdin;
3df66ac827f6
\.


--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendances (id, institute_id, student_id, batch_id, date, status, notes, marked_by, created_at, updated_at) FROM stdin;
cmsx1082q0036rl1u1nweepw3	cmsx108210000rl1u0wh8q33z	cmsx1082b000irl1upt270dht	cmsx10829000crl1u8t2v9ps6	2026-08-16	PRESENT	\N	cmsx108270004rl1uoekefcnv	2026-08-17 09:23:09.41	2026-08-17 09:23:09.41
cmsx1082r0038rl1unbjs0c2w	cmsx108210000rl1u0wh8q33z	cmsx1082c000mrl1ui6k0m9kv	cmsx10829000crl1u8t2v9ps6	2026-08-16	PRESENT	\N	cmsx108270004rl1uoekefcnv	2026-08-17 09:23:09.411	2026-08-17 09:23:09.411
cmsx1082r003arl1uiqbzf0ke	cmsx108210000rl1u0wh8q33z	cmsx1082d000qrl1utbl7s65d	cmsx10829000crl1u8t2v9ps6	2026-08-16	PRESENT	\N	cmsx108270004rl1uoekefcnv	2026-08-17 09:23:09.411	2026-08-17 09:23:09.411
cmsx1082r003crl1u5cc0euwh	cmsx108210000rl1u0wh8q33z	cmsx1082d000url1unwoxymkb	cmsx10829000crl1u8t2v9ps6	2026-08-16	LATE	\N	cmsx108270004rl1uoekefcnv	2026-08-17 09:23:09.412	2026-08-17 09:23:09.412
cmsx1082s003erl1u9iw3tyso	cmsx108210000rl1u0wh8q33z	cmsx1082e000yrl1uolsh25uv	cmsx10829000crl1u8t2v9ps6	2026-08-16	ABSENT	\N	cmsx108270004rl1uoekefcnv	2026-08-17 09:23:09.412	2026-08-17 09:23:09.412
cmsx1082s003grl1u3sjirmgw	cmsx108210000rl1u0wh8q33z	cmsx1082f0012rl1uxvmyomfb	cmsx10829000crl1u8t2v9ps6	2026-08-16	PRESENT	\N	cmsx108270004rl1uoekefcnv	2026-08-17 09:23:09.412	2026-08-17 09:23:09.412
cmsx1082s003irl1uytif518g	cmsx108210000rl1u0wh8q33z	cmsx1082g0016rl1ubdufuadx	cmsx10829000crl1u8t2v9ps6	2026-08-16	PRESENT	\N	cmsx108270004rl1uoekefcnv	2026-08-17 09:23:09.413	2026-08-17 09:23:09.413
cmsx1082t003krl1uret5tpmg	cmsx108210000rl1u0wh8q33z	cmsx1082h001arl1uj48j9lhj	cmsx10829000crl1u8t2v9ps6	2026-08-16	PRESENT	\N	cmsx108270004rl1uoekefcnv	2026-08-17 09:23:09.413	2026-08-17 09:23:09.413
cmsx1082t003mrl1uo1xkxy2d	cmsx108210000rl1u0wh8q33z	cmsx1082h001erl1ugctihrvv	cmsx10829000crl1u8t2v9ps6	2026-08-16	LATE	\N	cmsx108270004rl1uoekefcnv	2026-08-17 09:23:09.413	2026-08-17 09:23:09.413
cmsx1082t003orl1udtyzjhxa	cmsx108210000rl1u0wh8q33z	cmsx1082i001irl1udu8uzpt9	cmsx10829000crl1u8t2v9ps6	2026-08-16	ABSENT	\N	cmsx108270004rl1uoekefcnv	2026-08-17 09:23:09.414	2026-08-17 09:23:09.414
acff0809fd784576b0755954c6ea9c7c	cmsx108210000rl1u0wh8q33z	cmsx1082g0016rl1ubdufuadx	cmsx1082a000erl1uzuhokugo	2026-09-09	PRESENT	\N	Dr. Rafiqul Islam	2026-09-09 21:05:02.071	2026-09-09 21:05:02.071
\.


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.batches (id, institute_id, teacher_id, name, subject, schedule, monthly_fee, created_at, updated_at) FROM stdin;
cmsx10829000crl1u8t2v9ps6	cmsx108210000rl1u0wh8q33z	cmsx108280006rl1uh75inp1o	Class 10 - Higher Math Special	Higher Mathematics	Sat-Mon-Wed 04:00 PM - 05:30 PM	2500.00	2026-08-17 09:23:09.393	2026-08-17 09:23:09.393
cmsx1082a000erl1uzuhokugo	cmsx108210000rl1u0wh8q33z	cmsx10828000arl1ujaxhsr7v	Class 12 - Physics Revision	Physics	Sun-Tue-Thu 05:00 PM - 06:30 PM	3000.00	2026-08-17 09:23:09.394	2026-08-17 09:23:09.394
batch_a	inst_a	\N	Batch A	\N	\N	0.00	2026-09-03 12:41:41.534	2026-09-03 12:41:41.508
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, institute_id, title, category, amount, expense_date, notes, recorded_by, created_at, updated_at) FROM stdin;
cmsx108330053rl1u15r0pap4	cmsx108210000rl1u0wh8q33z	Campus Rent (Dhanmondi Branch)	Rent	45000.00	2026-08-17 09:23:09.424	Monthly venue lease payment	\N	2026-08-17 09:23:09.424	2026-08-17 09:23:09.424
cmsx108330054rl1u2pt3t8by	cmsx108210000rl1u0wh8q33z	Electricity & AC Bill	Utilities	8200.00	2026-08-17 09:23:09.424	DESCO monthly bill	\N	2026-08-17 09:23:09.424	2026-08-17 09:23:09.424
cmsx108330055rl1uf4ghum4h	cmsx108210000rl1u0wh8q33z	Photocopy Paper & Exam Sheets	Stationery	3400.00	2026-08-17 09:23:09.424	10 rims A4 paper & print cartridges	\N	2026-08-17 09:23:09.424	2026-08-17 09:23:09.424
\.


--
-- Data for Name: fees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fees (id, institute_id, student_id, receipt_no, amount, month_year, status, payment_method, transaction_id, payment_date, notes, created_at, updated_at) FROM stdin;
cmsx1082u003qrl1ujj18y33b	cmsx108210000rl1u0wh8q33z	cmsx1082b000irl1upt270dht	RCPT-2026-1000	2500.00	October 2024	PENDING	\N	\N	\N	Payment reminder sent to guardian	2026-08-17 09:23:09.414	2026-08-17 09:23:09.414
cmsx1082v003srl1u5zjms26x	cmsx108210000rl1u0wh8q33z	cmsx1082c000mrl1ui6k0m9kv	RCPT-2026-1001	2500.00	October 2024	PAID	CASH	\N	2026-08-17 09:23:09.415	Paid in full	2026-08-17 09:23:09.416	2026-08-17 09:23:09.416
cmsx1082w003url1ucysv7004	cmsx108210000rl1u0wh8q33z	cmsx1082d000qrl1utbl7s65d	RCPT-2026-1002	2500.00	October 2024	PAID	NAGAD	\N	2026-08-17 09:23:09.416	Paid in full	2026-08-17 09:23:09.416	2026-08-17 09:23:09.416
cmsx1082w003wrl1ug68guujb	cmsx108210000rl1u0wh8q33z	cmsx1082d000url1unwoxymkb	RCPT-2026-1003	2500.00	October 2024	PENDING	\N	\N	\N	Payment reminder sent to guardian	2026-08-17 09:23:09.417	2026-08-17 09:23:09.417
cmsx1082w003yrl1un1m1x7nw	cmsx108210000rl1u0wh8q33z	cmsx1082e000yrl1uolsh25uv	RCPT-2026-1004	2500.00	October 2024	PAID	BKASH	TRX-BK-84004	2026-08-17 09:23:09.416	Paid in full	2026-08-17 09:23:09.417	2026-08-17 09:23:09.417
cmsx1082x0040rl1uu6wtobus	cmsx108210000rl1u0wh8q33z	cmsx1082f0012rl1uxvmyomfb	RCPT-2026-1005	2500.00	October 2024	PAID	CASH	\N	2026-08-17 09:23:09.417	Paid in full	2026-08-17 09:23:09.417	2026-08-17 09:23:09.417
cmsx1082x0042rl1ugg4nencm	cmsx108210000rl1u0wh8q33z	cmsx1082g0016rl1ubdufuadx	RCPT-2026-1006	2500.00	October 2024	PENDING	\N	\N	\N	Payment reminder sent to guardian	2026-08-17 09:23:09.418	2026-08-17 09:23:09.418
cmsx1082x0044rl1us3ywjgr6	cmsx108210000rl1u0wh8q33z	cmsx1082h001arl1uj48j9lhj	RCPT-2026-1007	2500.00	October 2024	PAID	BANK_TRANSFER	\N	2026-08-17 09:23:09.417	Paid in full	2026-08-17 09:23:09.418	2026-08-17 09:23:09.418
cmsx1082y0046rl1uknlnt25t	cmsx108210000rl1u0wh8q33z	cmsx1082h001erl1ugctihrvv	RCPT-2026-1008	2500.00	October 2024	PAID	BKASH	TRX-BK-84008	2026-08-17 09:23:09.418	Paid in full	2026-08-17 09:23:09.418	2026-08-17 09:23:09.418
cmsx1082y0048rl1ufd3jns41	cmsx108210000rl1u0wh8q33z	cmsx1082i001irl1udu8uzpt9	RCPT-2026-1009	2500.00	October 2024	PENDING	\N	\N	\N	Payment reminder sent to guardian	2026-08-17 09:23:09.418	2026-08-17 09:23:09.418
cmsx1082y004arl1u7q3jt5vv	cmsx108210000rl1u0wh8q33z	cmsx1082i001mrl1uojzcuyp4	RCPT-2026-1010	3000.00	October 2024	PAID	NAGAD	\N	2026-08-17 09:23:09.418	Paid in full	2026-08-17 09:23:09.419	2026-08-17 09:23:09.419
cmsx1082z004crl1ut0bmyrzw	cmsx108210000rl1u0wh8q33z	cmsx1082j001qrl1u7lxnm4qt	RCPT-2026-1011	3000.00	October 2024	PAID	BANK_TRANSFER	\N	2026-08-17 09:23:09.419	Paid in full	2026-08-17 09:23:09.419	2026-08-17 09:23:09.419
cmsx1082z004erl1u4m8a24df	cmsx108210000rl1u0wh8q33z	cmsx1082k001url1uuroylr3y	RCPT-2026-1012	3000.00	October 2024	PENDING	\N	\N	\N	Payment reminder sent to guardian	2026-08-17 09:23:09.419	2026-08-17 09:23:09.419
cmsx1082z004grl1uwmqa9wde	cmsx108210000rl1u0wh8q33z	cmsx1082k001yrl1u27sqst3u	RCPT-2026-1013	3000.00	October 2024	PAID	CASH	\N	2026-08-17 09:23:09.419	Paid in full	2026-08-17 09:23:09.42	2026-08-17 09:23:09.42
cmsx1082z004irl1ua2su3isg	cmsx108210000rl1u0wh8q33z	cmsx1082l0022rl1udsw6f214	RCPT-2026-1014	3000.00	October 2024	PAID	NAGAD	\N	2026-08-17 09:23:09.419	Paid in full	2026-08-17 09:23:09.42	2026-08-17 09:23:09.42
\.


--
-- Data for Name: institutes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.institutes (id, name, code, phone, email, address, logo_url, subdomain, currency, timezone, default_language, created_at, updated_at) FROM stdin;
inst_b	Institute B	B	\N	\N	\N	\N	instb	BDT	Asia/Dhaka	en	2026-09-03 12:40:58.947	2026-09-03 12:40:58.886
inst_a	Institute A	A	\N	\N	\N	\N	insta	BDT	Asia/Dhaka	bn	2026-09-03 12:40:58.947	2026-09-03 12:42:33.819
cmsx108210000rl1u0wh8q33z	Ideal Coaching Center (Dhaka Branch)	INST-DHAKA-01	+880 1711-000000	contact@idealcoaching.bd	House 42, Road 7, Dhanmondi, Dhaka-1205	https://lh3.googleusercontent.com/aida-public/AB6AXuB1RtF3lsTq-wE897YPcKxxrNEUBpRytpQAb9yAf-72NOXPIfNQTJe24m6VStKTu6nuLOd-ybJhETSVx7zTAYV7UfIuk21LVr0hqSx04Ud_1MY_83MVgCGYX8h9o27cwlRf2rcTyFeqC6qHVa4MkC1griWGX7-0VKYK8eVYOqNcZaFFHhWxhe6htBJE9y7oIScCOlfP6X5MwV_O31zP57fFlLNNOxHd2tNYageotLLPQ2DaKV1yzn4-btVbPY5GwqB2cKsIzh4T6Q9p	eduflow-app	BDT	UTC+6	en	2026-08-17 09:23:09.386	2026-09-04 10:19:42.446
\.


--
-- Data for Name: results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.results (id, institute_id, student_id, batch_id, exam_name, subject, marks_obtained, total_marks, grade, exam_date, comments, created_at, updated_at) FROM stdin;
cmsx10830004krl1ulkry9ie5	cmsx108210000rl1u0wh8q33z	cmsx1082b000irl1upt270dht	cmsx10829000crl1u8t2v9ps6	Mid Term Exam 2024	Higher Mathematics	97.00	100.00	B	2026-08-17 09:23:09.42	Excellent problem solving	2026-08-17 09:23:09.42	2026-08-17 09:23:09.42
cmsx10830004mrl1uun8i0eqq	cmsx108210000rl1u0wh8q33z	cmsx1082c000mrl1ui6k0m9kv	cmsx10829000crl1u8t2v9ps6	Mid Term Exam 2024	Higher Mathematics	97.00	100.00	A	2026-08-17 09:23:09.42	Excellent problem solving	2026-08-17 09:23:09.421	2026-08-17 09:23:09.421
cmsx10831004orl1u1emczyjn	cmsx108210000rl1u0wh8q33z	cmsx1082d000qrl1utbl7s65d	cmsx10829000crl1u8t2v9ps6	Mid Term Exam 2024	Higher Mathematics	95.00	100.00	A	2026-08-17 09:23:09.421	Excellent problem solving	2026-08-17 09:23:09.421	2026-08-17 09:23:09.421
cmsx10831004qrl1unedxu2nw	cmsx108210000rl1u0wh8q33z	cmsx1082d000url1unwoxymkb	cmsx10829000crl1u8t2v9ps6	Mid Term Exam 2024	Higher Mathematics	75.00	100.00	C	2026-08-17 09:23:09.421	Needs practice in Calculus	2026-08-17 09:23:09.422	2026-08-17 09:23:09.422
cmsx10831004srl1uhole3fm1	cmsx108210000rl1u0wh8q33z	cmsx1082e000yrl1uolsh25uv	cmsx10829000crl1u8t2v9ps6	Mid Term Exam 2024	Higher Mathematics	74.00	100.00	C	2026-08-17 09:23:09.421	Needs practice in Calculus	2026-08-17 09:23:09.422	2026-08-17 09:23:09.422
cmsx10832004url1u46uxgq6a	cmsx108210000rl1u0wh8q33z	cmsx1082f0012rl1uxvmyomfb	cmsx10829000crl1u8t2v9ps6	Mid Term Exam 2024	Higher Mathematics	90.00	100.00	A+	2026-08-17 09:23:09.422	Excellent problem solving	2026-08-17 09:23:09.422	2026-08-17 09:23:09.422
cmsx10832004wrl1u58txcave	cmsx108210000rl1u0wh8q33z	cmsx1082g0016rl1ubdufuadx	cmsx10829000crl1u8t2v9ps6	Mid Term Exam 2024	Higher Mathematics	94.00	100.00	C	2026-08-17 09:23:09.422	Excellent problem solving	2026-08-17 09:23:09.423	2026-08-17 09:23:09.423
cmsx10832004yrl1ua4w0d526	cmsx108210000rl1u0wh8q33z	cmsx1082h001arl1uj48j9lhj	cmsx10829000crl1u8t2v9ps6	Mid Term Exam 2024	Higher Mathematics	80.00	100.00	A+	2026-08-17 09:23:09.422	Excellent problem solving	2026-08-17 09:23:09.423	2026-08-17 09:23:09.423
cmsx108330050rl1uv69shuow	cmsx108210000rl1u0wh8q33z	cmsx1082h001erl1ugctihrvv	cmsx10829000crl1u8t2v9ps6	Mid Term Exam 2024	Higher Mathematics	84.00	100.00	A+	2026-08-17 09:23:09.422	Excellent problem solving	2026-08-17 09:23:09.423	2026-08-17 09:23:09.423
cmsx108330052rl1uxgnxc67e	cmsx108210000rl1u0wh8q33z	cmsx1082i001irl1udu8uzpt9	cmsx10829000crl1u8t2v9ps6	Mid Term Exam 2024	Higher Mathematics	90.00	100.00	B	2026-08-17 09:23:09.423	Excellent problem solving	2026-08-17 09:23:09.423	2026-08-17 09:23:09.423
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, session_token, user_id, expires) FROM stdin;
\.


--
-- Data for Name: student_batches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_batches (id, institute_id, student_id, batch_id, enrolled_at) FROM stdin;
cmsx1082l0024rl1ubqi3h36t	cmsx108210000rl1u0wh8q33z	cmsx1082b000irl1upt270dht	cmsx10829000crl1u8t2v9ps6	2026-08-17 09:23:09.406
cmsx1082m0026rl1uz85yw8m2	cmsx108210000rl1u0wh8q33z	cmsx1082c000mrl1ui6k0m9kv	cmsx10829000crl1u8t2v9ps6	2026-08-17 09:23:09.406
cmsx1082m0028rl1uhtr4t4ki	cmsx108210000rl1u0wh8q33z	cmsx1082d000qrl1utbl7s65d	cmsx10829000crl1u8t2v9ps6	2026-08-17 09:23:09.407
cmsx1082m002arl1upx4q6pw7	cmsx108210000rl1u0wh8q33z	cmsx1082d000url1unwoxymkb	cmsx10829000crl1u8t2v9ps6	2026-08-17 09:23:09.407
cmsx1082n002crl1u2a136k4i	cmsx108210000rl1u0wh8q33z	cmsx1082e000yrl1uolsh25uv	cmsx10829000crl1u8t2v9ps6	2026-08-17 09:23:09.407
cmsx1082n002erl1use618myg	cmsx108210000rl1u0wh8q33z	cmsx1082f0012rl1uxvmyomfb	cmsx10829000crl1u8t2v9ps6	2026-08-17 09:23:09.407
cmsx1082n002grl1ul5sglekg	cmsx108210000rl1u0wh8q33z	cmsx1082g0016rl1ubdufuadx	cmsx10829000crl1u8t2v9ps6	2026-08-17 09:23:09.408
cmsx1082n002irl1uwmruy6ct	cmsx108210000rl1u0wh8q33z	cmsx1082g0016rl1ubdufuadx	cmsx1082a000erl1uzuhokugo	2026-08-17 09:23:09.408
cmsx1082n002krl1uqu3cfrej	cmsx108210000rl1u0wh8q33z	cmsx1082h001arl1uj48j9lhj	cmsx10829000crl1u8t2v9ps6	2026-08-17 09:23:09.408
cmsx1082o002mrl1u20l0szcq	cmsx108210000rl1u0wh8q33z	cmsx1082h001arl1uj48j9lhj	cmsx1082a000erl1uzuhokugo	2026-08-17 09:23:09.408
cmsx1082o002orl1u090fnzjs	cmsx108210000rl1u0wh8q33z	cmsx1082h001erl1ugctihrvv	cmsx10829000crl1u8t2v9ps6	2026-08-17 09:23:09.408
cmsx1082o002qrl1uzdxe74l4	cmsx108210000rl1u0wh8q33z	cmsx1082h001erl1ugctihrvv	cmsx1082a000erl1uzuhokugo	2026-08-17 09:23:09.409
cmsx1082o002srl1ub1r0czst	cmsx108210000rl1u0wh8q33z	cmsx1082i001irl1udu8uzpt9	cmsx10829000crl1u8t2v9ps6	2026-08-17 09:23:09.409
cmsx1082p002url1udg0xnw6d	cmsx108210000rl1u0wh8q33z	cmsx1082i001irl1udu8uzpt9	cmsx1082a000erl1uzuhokugo	2026-08-17 09:23:09.409
cmsx1082p002wrl1u8bszsx5n	cmsx108210000rl1u0wh8q33z	cmsx1082i001mrl1uojzcuyp4	cmsx1082a000erl1uzuhokugo	2026-08-17 09:23:09.409
cmsx1082p002yrl1uh5vhjjpj	cmsx108210000rl1u0wh8q33z	cmsx1082j001qrl1u7lxnm4qt	cmsx1082a000erl1uzuhokugo	2026-08-17 09:23:09.409
cmsx1082p0030rl1uxke9csk6	cmsx108210000rl1u0wh8q33z	cmsx1082k001url1uuroylr3y	cmsx1082a000erl1uzuhokugo	2026-08-17 09:23:09.41
cmsx1082p0032rl1uvopeuvaf	cmsx108210000rl1u0wh8q33z	cmsx1082k001yrl1u27sqst3u	cmsx1082a000erl1uzuhokugo	2026-08-17 09:23:09.41
cmsx1082q0034rl1uwlaj3ujk	cmsx108210000rl1u0wh8q33z	cmsx1082l0022rl1udsw6f214	cmsx1082a000erl1uzuhokugo	2026-08-17 09:23:09.41
c1e4814ac9574b258e9b2ce785566cea	inst_a	student_a	batch_a	2026-09-03 12:41:41.595
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.students (id, institute_id, user_id, roll_no, full_name, email, gender, blood_group, date_of_birth, guardian_name, guardian_phone, address, photo_url, status, admission_date, created_at, updated_at) FROM stdin;
cmsx1082b000irl1upt270dht	cmsx108210000rl1u0wh8q33z	cmsx1082a000grl1u1ig5ljmc	2026-001	Aisha Rahman	student1@eduflow.bd	Female	A+	\N	Abdur Rahman	+880 1711-100201	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.395	2026-08-17 09:23:09.395	2026-08-17 09:23:09.395
cmsx1082c000mrl1ui6k0m9kv	cmsx108210000rl1u0wh8q33z	cmsx1082c000krl1uxnfotm5e	2026-002	Tanvir Ahmed	student2@eduflow.bd	Male	B+	\N	Tariq Ahmed	+880 1711-100202	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.396	2026-08-17 09:23:09.396	2026-08-17 09:23:09.396
cmsx1082d000qrl1utbl7s65d	cmsx108210000rl1u0wh8q33z	cmsx1082c000orl1ul0uskd6n	2026-003	Nusrat Jahan	student3@eduflow.bd	Female	O+	\N	Mahbubul Alam	+880 1711-100203	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.397	2026-08-17 09:23:09.397	2026-08-17 09:23:09.397
cmsx1082d000url1unwoxymkb	cmsx108210000rl1u0wh8q33z	cmsx1082d000srl1uhh2ijifi	2026-004	Syed Ahsan	student4@eduflow.bd	Male	AB+	\N	Syed Mahmud	+880 1711-100204	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.398	2026-08-17 09:23:09.398	2026-08-17 09:23:09.398
cmsx1082e000yrl1uolsh25uv	cmsx108210000rl1u0wh8q33z	cmsx1082e000wrl1uxpphg9uz	2026-005	Fahim Hossain	student5@eduflow.bd	Male	O-	\N	Delwar Hossain	+880 1711-100205	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.398	2026-08-17 09:23:09.398	2026-08-17 09:23:09.398
cmsx1082f0012rl1uxvmyomfb	cmsx108210000rl1u0wh8q33z	cmsx1082e0010rl1uak4on0og	2026-006	Sadia Islam	student6@eduflow.bd	Female	A-	\N	Shafiqul Islam	+880 1711-100206	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.399	2026-08-17 09:23:09.399	2026-08-17 09:23:09.399
cmsx1082g0016rl1ubdufuadx	cmsx108210000rl1u0wh8q33z	cmsx1082f0014rl1uwadki6lu	2026-007	Zubair Al-Mamun	student7@eduflow.bd	Male	B-	\N	Al-Mamun Khan	+880 1711-100207	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.4	2026-08-17 09:23:09.4	2026-08-17 09:23:09.4
cmsx1082h001arl1uj48j9lhj	cmsx108210000rl1u0wh8q33z	cmsx1082g0018rl1u5tn707kr	2026-008	Anika Tabassum	student8@eduflow.bd	Female	O+	\N	Kamrul Islam	+880 1711-100208	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.401	2026-08-17 09:23:09.401	2026-08-17 09:23:09.401
cmsx1082h001erl1ugctihrvv	cmsx108210000rl1u0wh8q33z	cmsx1082h001crl1um27pfxbg	2026-009	Mahir Faisal	student9@eduflow.bd	Male	A+	\N	Faisal Ahmed	+880 1711-100209	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.402	2026-08-17 09:23:09.402	2026-08-17 09:23:09.402
cmsx1082i001irl1udu8uzpt9	cmsx108210000rl1u0wh8q33z	cmsx1082h001grl1u8cg6mpbw	2026-010	Tasnim Sultana	student10@eduflow.bd	Female	AB-	\N	Sultan Mahmud	+880 1711-100210	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.402	2026-08-17 09:23:09.402	2026-08-17 09:23:09.402
cmsx1082i001mrl1uojzcuyp4	cmsx108210000rl1u0wh8q33z	cmsx1082i001krl1u9iy5mq2v	2026-011	Naimur Rahman	student11@eduflow.bd	Male	B+	\N	Mustafizur Rahman	+880 1711-100211	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.403	2026-08-17 09:23:09.403	2026-08-17 09:23:09.403
cmsx1082j001qrl1u7lxnm4qt	cmsx108210000rl1u0wh8q33z	cmsx1082j001orl1ujn5xkv8u	2026-012	Meherin Akter	student12@eduflow.bd	Female	O+	\N	Jahangir Alam	+880 1711-100212	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.404	2026-08-17 09:23:09.404	2026-08-17 09:23:09.404
cmsx1082k001url1uuroylr3y	cmsx108210000rl1u0wh8q33z	cmsx1082k001srl1ub66e9cyr	2026-013	Rafid Hasan	student13@eduflow.bd	Male	A+	\N	Nazmul Hasan	+880 1711-100213	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.404	2026-08-17 09:23:09.404	2026-08-17 09:23:09.404
cmsx1082k001yrl1u27sqst3u	cmsx108210000rl1u0wh8q33z	cmsx1082k001wrl1uswkip4ih	2026-014	Sabrina Yasmin	student14@eduflow.bd	Female	B+	\N	Khorshed Alam	+880 1711-100214	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.405	2026-08-17 09:23:09.405	2026-08-17 09:23:09.405
cmsx1082l0022rl1udsw6f214	cmsx108210000rl1u0wh8q33z	cmsx1082l0020rl1u9k5wk6qx	2026-015	Imran Khan	student15@eduflow.bd	Male	AB+	\N	Asaduzzaman Khan	+880 1711-100215	Dhanmondi, Dhaka	\N	ACTIVE	2026-08-17 09:23:09.405	2026-08-17 09:23:09.405	2026-08-17 09:23:09.405
student_a	inst_a	\N	A001	Updated Name	\N	\N	\N	\N	\N	\N	\N	\N	SUSPENDED	2026-09-03 12:41:41.534	2026-09-03 12:41:41.534	2026-09-03 12:42:04.781
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teachers (id, institute_id, user_id, subject, phone, joining_date, created_at, updated_at) FROM stdin;
cmsx108280006rl1uh75inp1o	cmsx108210000rl1u0wh8q33z	cmsx108270004rl1uoekefcnv	Higher Mathematics	+880 1812-111222	2026-08-17 09:23:09.392	2026-08-17 09:23:09.392	2026-08-17 09:23:09.392
cmsx10828000arl1ujaxhsr7v	cmsx108210000rl1u0wh8q33z	cmsx108280008rl1uc4w56mu0	Physics	+880 1913-333444	2026-08-17 09:23:09.393	2026-08-17 09:23:09.393	2026-08-17 09:23:09.393
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, institute_id, name, email, password_hash, role, avatar_url, created_at, updated_at) FROM stdin;
cmsx108250002rl1u5p7w1dh1	cmsx108210000rl1u0wh8q33z	Dr. Rafiqul Islam	owner@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	OWNER	https://lh3.googleusercontent.com/aida-public/AB6AXuCcYvSOYEj2uLbUE0-oI8Ys6olo06MrlatBgCi-oFG3U8ao6u8aBJViRCCCsiDuXulFizICIuJ9FxCZ_ceH4fGd4QQo7t1LFdQ8eiXWTANbZFZjO_CzFe_fRXPIBOlL6uT1yOia66tSodlmp5a8Qlu3IKvCooHnt4dZK1K6OuxyEo52stNlHfASMJKJ7i8aOvksdsWT8GuNc6YR6jRdayFP6YMtkjjwRsYXa_Hflmu4aYooR9J3qulKsu_XtxSNbRgVGra-6AFR0tPp	2026-08-17 09:23:09.389	2026-08-17 09:23:09.389
cmsx108270004rl1uoekefcnv	cmsx108210000rl1u0wh8q33z	Kamrul Hasan	kamrul@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	TEACHER	https://lh3.googleusercontent.com/aida-public/AB6AXuAy4FRP0tE0d-evVz_7VaLN-8FsUeaR4j4HWQ8w7YczQZU6fWKcxHyAuBiZYCzPpO0BkCrNv3gGy5BhKfdKQeeRzqKC0qESWxvqwuW7-GNVUP5SrEfelOC4QKZtS3XSijTKLgnDzWGoMCqlkAuMFSs3-M8p5JDaAJ_9abnU5hGCU2YrtOHGpsXwOLikdJCj2snul6gA2qRUckgAeqhPxkFdREBD6q9GnTvkzGtYKzxXlrVVt3YGglr02CYUOQ6DvuonKWU33g9TmpIR	2026-08-17 09:23:09.392	2026-08-17 09:23:09.392
cmsx108280008rl1uc4w56mu0	cmsx108210000rl1u0wh8q33z	Farhana Nusrat	farhana@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	TEACHER	https://lh3.googleusercontent.com/aida-public/AB6AXuAD9kiyu9yWEPOiI0T5Mqki6zmGy6oi13ysmpOtg5-VSihU-Dg1jnvcfw6C3dYHTse9GaDQls0VhUfNADRTzj48mIg23V6MMv2QzeJsBNaM9xeuSYCkxeqq0KDqsgddA6mdmwhCZjAMkmLjijdngwav3v5ciONkYnL0FQkVyGyCb9bnGJI4id9Xv9690-z6yeqBNCZbh6DaP-hCzwsDUkw_906mph9ngq_Ntfk8V1_VAAUQLos-fOnYtK8tfSKjx3If-8QWiQ9bem2J	2026-08-17 09:23:09.393	2026-08-17 09:23:09.393
cmsx1082a000grl1u1ig5ljmc	cmsx108210000rl1u0wh8q33z	Aisha Rahman	student1@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.395	2026-08-17 09:23:09.395
cmsx1082c000krl1uxnfotm5e	cmsx108210000rl1u0wh8q33z	Tanvir Ahmed	student2@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.396	2026-08-17 09:23:09.396
cmsx1082c000orl1ul0uskd6n	cmsx108210000rl1u0wh8q33z	Nusrat Jahan	student3@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.397	2026-08-17 09:23:09.397
cmsx1082d000srl1uhh2ijifi	cmsx108210000rl1u0wh8q33z	Syed Ahsan	student4@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.397	2026-08-17 09:23:09.397
cmsx1082e000wrl1uxpphg9uz	cmsx108210000rl1u0wh8q33z	Fahim Hossain	student5@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.398	2026-08-17 09:23:09.398
cmsx1082e0010rl1uak4on0og	cmsx108210000rl1u0wh8q33z	Sadia Islam	student6@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.399	2026-08-17 09:23:09.399
cmsx1082f0014rl1uwadki6lu	cmsx108210000rl1u0wh8q33z	Zubair Al-Mamun	student7@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.4	2026-08-17 09:23:09.4
cmsx1082g0018rl1u5tn707kr	cmsx108210000rl1u0wh8q33z	Anika Tabassum	student8@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.401	2026-08-17 09:23:09.401
cmsx1082h001crl1um27pfxbg	cmsx108210000rl1u0wh8q33z	Mahir Faisal	student9@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.401	2026-08-17 09:23:09.401
cmsx1082h001grl1u8cg6mpbw	cmsx108210000rl1u0wh8q33z	Tasnim Sultana	student10@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.402	2026-08-17 09:23:09.402
cmsx1082i001krl1u9iy5mq2v	cmsx108210000rl1u0wh8q33z	Naimur Rahman	student11@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.402	2026-08-17 09:23:09.402
cmsx1082j001orl1ujn5xkv8u	cmsx108210000rl1u0wh8q33z	Meherin Akter	student12@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.403	2026-08-17 09:23:09.403
cmsx1082k001srl1ub66e9cyr	cmsx108210000rl1u0wh8q33z	Rafid Hasan	student13@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.404	2026-08-17 09:23:09.404
cmsx1082k001wrl1uswkip4ih	cmsx108210000rl1u0wh8q33z	Sabrina Yasmin	student14@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.405	2026-08-17 09:23:09.405
cmsx1082l0020rl1u9k5wk6qx	cmsx108210000rl1u0wh8q33z	Imran Khan	student15@eduflow.bd	$2b$10$5a/GtyihWW8bThz4GtZ96..hyKJJvbjamVglbp8eMjGWWOkrU4ABu	STUDENT	\N	2026-08-17 09:23:09.405	2026-08-17 09:23:09.405
user_a	inst_a	User A	a@a.com	hash	OWNER	\N	2026-09-03 12:40:58.947	2026-09-03 12:40:58.886
user_b	inst_b	User B	b@b.com	hash	TEACHER	\N	2026-09-03 12:40:58.947	2026-09-03 12:40:58.886
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verification_tokens (identifier, token, expires) FROM stdin;
\.


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: batches batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: fees fees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fees
    ADD CONSTRAINT fees_pkey PRIMARY KEY (id);


--
-- Name: institutes institutes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutes
    ADD CONSTRAINT institutes_pkey PRIMARY KEY (id);


--
-- Name: results results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: student_batches student_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_batches
    ADD CONSTRAINT student_batches_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: accounts_provider_provider_account_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX accounts_provider_provider_account_id_key ON public.accounts USING btree (provider, provider_account_id);


--
-- Name: activity_logs_institute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_institute_id_idx ON public.activity_logs USING btree (institute_id);


--
-- Name: attendances_batch_id_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendances_batch_id_date_idx ON public.attendances USING btree (batch_id, date);


--
-- Name: attendances_institute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendances_institute_id_idx ON public.attendances USING btree (institute_id);


--
-- Name: attendances_student_id_batch_id_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX attendances_student_id_batch_id_date_key ON public.attendances USING btree (student_id, batch_id, date);


--
-- Name: batches_institute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX batches_institute_id_idx ON public.batches USING btree (institute_id);


--
-- Name: batches_teacher_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX batches_teacher_id_idx ON public.batches USING btree (teacher_id);


--
-- Name: expenses_institute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_institute_id_idx ON public.expenses USING btree (institute_id);


--
-- Name: fees_institute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fees_institute_id_idx ON public.fees USING btree (institute_id);


--
-- Name: fees_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fees_student_id_idx ON public.fees USING btree (student_id);


--
-- Name: institutes_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX institutes_code_key ON public.institutes USING btree (code);


--
-- Name: institutes_subdomain_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX institutes_subdomain_key ON public.institutes USING btree (subdomain);


--
-- Name: results_batch_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX results_batch_id_idx ON public.results USING btree (batch_id);


--
-- Name: results_institute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX results_institute_id_idx ON public.results USING btree (institute_id);


--
-- Name: results_student_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX results_student_id_idx ON public.results USING btree (student_id);


--
-- Name: sessions_session_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sessions_session_token_key ON public.sessions USING btree (session_token);


--
-- Name: student_batches_institute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_batches_institute_id_idx ON public.student_batches USING btree (institute_id);


--
-- Name: student_batches_student_id_batch_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX student_batches_student_id_batch_id_key ON public.student_batches USING btree (student_id, batch_id);


--
-- Name: students_institute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX students_institute_id_idx ON public.students USING btree (institute_id);


--
-- Name: students_institute_id_roll_no_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX students_institute_id_roll_no_key ON public.students USING btree (institute_id, roll_no);


--
-- Name: students_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX students_user_id_key ON public.students USING btree (user_id);


--
-- Name: teachers_institute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teachers_institute_id_idx ON public.teachers USING btree (institute_id);


--
-- Name: teachers_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX teachers_user_id_key ON public.teachers USING btree (user_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_institute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_institute_id_idx ON public.users USING btree (institute_id);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: attendances attendances_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendances attendances_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendances attendances_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: batches batches_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: batches batches_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fees fees_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fees
    ADD CONSTRAINT fees_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fees fees_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fees
    ADD CONSTRAINT fees_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: results results_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: results results_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: results results_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_batches student_batches_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_batches
    ADD CONSTRAINT student_batches_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_batches student_batches_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_batches
    ADD CONSTRAINT student_batches_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_batches student_batches_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_batches
    ADD CONSTRAINT student_batches_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students students_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teachers teachers_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teachers teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

-- \unrestrict pggnkTWL8j8aFnJMnhYqKxXE9uUn0CDR9r8GEmrOm2eRIaqrV6NYJ7DIhfK4dF5

