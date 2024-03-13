--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2 (Postgres.app)
-- Dumped by pg_dump version 16.2 (Postgres.app)

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: conversation; Type: TABLE; Schema: public; Owner: sumitnalavade
--

CREATE TABLE public.conversation (
    id character varying NOT NULL,
    title character varying NOT NULL,
    date_created bigint NOT NULL,
    date_updated bigint NOT NULL,
    user_id character varying
);


ALTER TABLE public.conversation OWNER TO sumitnalavade;

--
-- Name: location; Type: TABLE; Schema: public; Owner: sumitnalavade
--

CREATE TABLE public.location (
    id character varying NOT NULL,
    name character varying NOT NULL,
    address character varying NOT NULL,
    city character varying NOT NULL,
    state character varying NOT NULL,
    country character varying NOT NULL,
    zip_code character varying NOT NULL,
    county character varying NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    description character varying NOT NULL,
    phone character varying NOT NULL,
    sunday_hours character varying NOT NULL,
    monday_hours character varying NOT NULL,
    tuesday_hours character varying NOT NULL,
    wednesday_hours character varying NOT NULL,
    thursday_hours character varying NOT NULL,
    friday_hours character varying NOT NULL,
    saturday_hours character varying NOT NULL,
    rating character varying NOT NULL,
    address_link character varying NOT NULL,
    website character varying NOT NULL,
    resource_type character varying NOT NULL
);


ALTER TABLE public.location OWNER TO sumitnalavade;

--
-- Name: response; Type: TABLE; Schema: public; Owner: sumitnalavade
--

CREATE TABLE public.response (
    id character varying NOT NULL,
    user_query character varying NOT NULL,
    locations character varying[] NOT NULL,
    date_created bigint NOT NULL,
    conversation_id character varying NOT NULL
);


ALTER TABLE public.response OWNER TO sumitnalavade;

--
-- Name: saved_location; Type: TABLE; Schema: public; Owner: sumitnalavade
--

CREATE TABLE public.saved_location (
    id character varying NOT NULL,
    user_id character varying NOT NULL,
    name character varying NOT NULL,
    date_created bigint NOT NULL,
    existing_location_id character varying NOT NULL
);


ALTER TABLE public.saved_location OWNER TO sumitnalavade;

--
-- Name: user; Type: TABLE; Schema: public; Owner: sumitnalavade
--

CREATE TABLE public."user" (
    id character varying NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    is_admin boolean NOT NULL,
    date_created bigint NOT NULL
);


ALTER TABLE public."user" OWNER TO sumitnalavade;

--
-- Name: conversation conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: sumitnalavade
--

ALTER TABLE ONLY public.conversation
    ADD CONSTRAINT conversation_pkey PRIMARY KEY (id);


--
-- Name: location location_name_key; Type: CONSTRAINT; Schema: public; Owner: sumitnalavade
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_name_key UNIQUE (name);


--
-- Name: location location_pkey; Type: CONSTRAINT; Schema: public; Owner: sumitnalavade
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);


--
-- Name: response response_pkey; Type: CONSTRAINT; Schema: public; Owner: sumitnalavade
--

ALTER TABLE ONLY public.response
    ADD CONSTRAINT response_pkey PRIMARY KEY (id);


--
-- Name: saved_location saved_location_pkey; Type: CONSTRAINT; Schema: public; Owner: sumitnalavade
--

ALTER TABLE ONLY public.saved_location
    ADD CONSTRAINT saved_location_pkey PRIMARY KEY (id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: sumitnalavade
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: sumitnalavade
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: conversation conversation_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sumitnalavade
--

ALTER TABLE ONLY public.conversation
    ADD CONSTRAINT conversation_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: response response_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sumitnalavade
--

ALTER TABLE ONLY public.response
    ADD CONSTRAINT response_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversation(id) ON DELETE CASCADE;


--
-- Name: saved_location saved_location_existing_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sumitnalavade
--

ALTER TABLE ONLY public.saved_location
    ADD CONSTRAINT saved_location_existing_location_id_fkey FOREIGN KEY (existing_location_id) REFERENCES public.location(id) ON DELETE CASCADE;


--
-- Name: saved_location saved_location_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sumitnalavade
--

ALTER TABLE ONLY public.saved_location
    ADD CONSTRAINT saved_location_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

