PGDMP                   
    |            recipe    16.2    16.2 $               0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    55106    recipe    DATABASE     �   CREATE DATABASE recipe WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE recipe;
                rcumm    false            �            1259    55143 
   ingredient    TABLE     T   CREATE TABLE public.ingredient (
    id integer NOT NULL,
    name text NOT NULL
);
    DROP TABLE public.ingredient;
       public         heap    rcumm    false            �            1259    55142    ingredient_id_seq    SEQUENCE     �   CREATE SEQUENCE public.ingredient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.ingredient_id_seq;
       public          rcumm    false    221                       0    0    ingredient_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.ingredient_id_seq OWNED BY public.ingredient.id;
          public          rcumm    false    220            �            1259    55108    recipe    TABLE     �   CREATE TABLE public.recipe (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    instructions text NOT NULL,
    tag text NOT NULL
);
    DROP TABLE public.recipe;
       public         heap    rcumm    false            �            1259    55107    recipe_id_seq    SEQUENCE     �   CREATE SEQUENCE public.recipe_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.recipe_id_seq;
       public          rcumm    false    216                       0    0    recipe_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.recipe_id_seq OWNED BY public.recipe.id;
          public          rcumm    false    215            �            1259    55153    recipe_ingredient    TABLE     �   CREATE TABLE public.recipe_ingredient (
    recipe_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    quantity numeric,
    unit text
);
 %   DROP TABLE public.recipe_ingredient;
       public         heap    rcumm    false            �            1259    55127    user_favorites    TABLE     e   CREATE TABLE public.user_favorites (
    user_id integer NOT NULL,
    recipe_id integer NOT NULL
);
 "   DROP TABLE public.user_favorites;
       public         heap    rcumm    false            �            1259    55117    users    TABLE     I  CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(25),
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_check CHECK ((POSITION(('@'::text) IN (email)) > 1))
);
    DROP TABLE public.users;
       public         heap    rcumm    false            �            1259    55116    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          rcumm    false    218                       0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          rcumm    false    217            e           2604    55146    ingredient id    DEFAULT     n   ALTER TABLE ONLY public.ingredient ALTER COLUMN id SET DEFAULT nextval('public.ingredient_id_seq'::regclass);
 <   ALTER TABLE public.ingredient ALTER COLUMN id DROP DEFAULT;
       public          rcumm    false    220    221    221            b           2604    55111 	   recipe id    DEFAULT     f   ALTER TABLE ONLY public.recipe ALTER COLUMN id SET DEFAULT nextval('public.recipe_id_seq'::regclass);
 8   ALTER TABLE public.recipe ALTER COLUMN id DROP DEFAULT;
       public          rcumm    false    216    215    216            c           2604    55120    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          rcumm    false    217    218    218                      0    55143 
   ingredient 
   TABLE DATA           .   COPY public.ingredient (id, name) FROM stdin;
    public          rcumm    false    221   �(                 0    55108    recipe 
   TABLE DATA           K   COPY public.recipe (id, title, description, instructions, tag) FROM stdin;
    public          rcumm    false    216   N*                 0    55153    recipe_ingredient 
   TABLE DATA           U   COPY public.recipe_ingredient (recipe_id, ingredient_id, quantity, unit) FROM stdin;
    public          rcumm    false    222   G3       
          0    55127    user_favorites 
   TABLE DATA           <   COPY public.user_favorites (user_id, recipe_id) FROM stdin;
    public          rcumm    false    219   v4       	          0    55117    users 
   TABLE DATA           _   COPY public.users (id, username, password, first_name, last_name, email, is_admin) FROM stdin;
    public          rcumm    false    218   �4                  0    0    ingredient_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.ingredient_id_seq', 42, true);
          public          rcumm    false    220                       0    0    recipe_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.recipe_id_seq', 7, true);
          public          rcumm    false    215                       0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 1, true);
          public          rcumm    false    217            n           2606    55152    ingredient ingredient_name_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.ingredient
    ADD CONSTRAINT ingredient_name_key UNIQUE (name);
 H   ALTER TABLE ONLY public.ingredient DROP CONSTRAINT ingredient_name_key;
       public            rcumm    false    221            p           2606    55150    ingredient ingredient_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.ingredient
    ADD CONSTRAINT ingredient_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.ingredient DROP CONSTRAINT ingredient_pkey;
       public            rcumm    false    221            r           2606    55159 (   recipe_ingredient recipe_ingredient_pkey 
   CONSTRAINT     |   ALTER TABLE ONLY public.recipe_ingredient
    ADD CONSTRAINT recipe_ingredient_pkey PRIMARY KEY (recipe_id, ingredient_id);
 R   ALTER TABLE ONLY public.recipe_ingredient DROP CONSTRAINT recipe_ingredient_pkey;
       public            rcumm    false    222    222            h           2606    55115    recipe recipe_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.recipe
    ADD CONSTRAINT recipe_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.recipe DROP CONSTRAINT recipe_pkey;
       public            rcumm    false    216            l           2606    55131 "   user_favorites user_favorites_pkey 
   CONSTRAINT     p   ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_pkey PRIMARY KEY (user_id, recipe_id);
 L   ALTER TABLE ONLY public.user_favorites DROP CONSTRAINT user_favorites_pkey;
       public            rcumm    false    219    219            j           2606    55126    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            rcumm    false    218            u           2606    55165 6   recipe_ingredient recipe_ingredient_ingredient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.recipe_ingredient
    ADD CONSTRAINT recipe_ingredient_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredient(id) ON DELETE CASCADE;
 `   ALTER TABLE ONLY public.recipe_ingredient DROP CONSTRAINT recipe_ingredient_ingredient_id_fkey;
       public          rcumm    false    221    4720    222            v           2606    55160 2   recipe_ingredient recipe_ingredient_recipe_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.recipe_ingredient
    ADD CONSTRAINT recipe_ingredient_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipe(id) ON DELETE CASCADE;
 \   ALTER TABLE ONLY public.recipe_ingredient DROP CONSTRAINT recipe_ingredient_recipe_id_fkey;
       public          rcumm    false    4712    222    216            s           2606    55137 ,   user_favorites user_favorites_recipe_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipe(id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY public.user_favorites DROP CONSTRAINT user_favorites_recipe_id_fkey;
       public          rcumm    false    219    4712    216            t           2606    55132 *   user_favorites user_favorites_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.user_favorites DROP CONSTRAINT user_favorites_user_id_fkey;
       public          rcumm    false    219    4714    218               }  x�]�A��0��3�� T�i�=��R�]��J��4mLb{����,�����޳��w��A�S.h�]�W�'���}r9��gΌ܎qJ��wk8P"�@��8ƂxOI���s�
���z{��j$ɣ6�Ɖ*��A[8��Gǘ�S�Q����%v�vS)�P/�1ut��z��X��)�Ь���b�h4����A�����{4Δ���TpOs���5kh9�g�2_�6�:M���i@s��6�:ql@W"����>u�i������qY3%��
v��EH�m^�#���I}^�mI��%��E��B�rR�n����z�
��{�k�O�{��|�7�?�����Kh����[�~�E���kD�Z��t         �  x��X]oܶ}^�
�>��z�I��p4�׈S�W���D���Y��{fHj��o�Z"��q�̡�W�[ӓ�iM��^]{�!.�u���/����tjzU�%kY�v&��%�V���F�N��z�h�~#��'�6c�:��U]�]贵Jwn�r�rƊ��ꊦ���S��ݮ_)u�Dػ8}�:ӏ���u��U �(O��j���6�X3���bk�������&�$Ѱ1?����x�d?�j�R�� ܺx�Nմ�D)H�"uyGO�BW-u�KYԝn=�-����v�>S�I����F@��@,�t��p�O��c��)��Rw��!ɟ��a~��׺��lZ��R�p�U�\��I�����ђ��r�r�5㑲��� 5}�_���I ���!V�먯��.�8ጴg�q�ut\��G�P�kK�-�G�}��G��ߟ\,>c�W���&������>�uX<X��on��c���V����qJ�C��XE���^e�� �c�Z�0�ϳH{�`��˒�騕�Fi��f����E)@��R���O�*�`=�+����1JN� ,[��nG>X˻\V��w0��nD�Q������
���K����{�Oه��c=ը�����Vcc�3�����},k�x-R����W�-��E�	�=��rMB7<�Y��G����$�Af��նY��^�w��8���v�D8��K�$�}���3���jM���.�QQ=cv�L]N�>r�C�?ǒ��AJ#�.�So�����&w��y�t���Td$̂9P�,2�Hb��?�t0�-�ʮ�s�"�[~��C��Yk�M�R_�2�O��F���B-ih�@�Aw4V?:/�j�&_�M]�LLJ�a8f�������=�@x�s�k�*p�),��.������
@���l�e���*������)��x�Z��.>�m�r��^��Wtk�s��Sv\� Ų�0W{e�Ŗ��5���_H��:����8�@������i.���=���{)��(���Az�<�X1H���/V�W�Fn���3$�w�l�P�3Z�jDo�Y�oQpY�xRЃ!~�$�������Q�2d_���-�%�p@�9�A�nk�6H�hӇ���5Sb`�֛�'����~��֙`�����T_�$Z��S���!�8W��[�ꍵ�H��^r��:+��f�7ޔ�����'{j�PR3�����m����ޒ�vi�6�+���!�
�����![���8#�'�9xǩÖ5M|�Ȭ�.�������^�)�=�;MW�O5GB`:{����wE�HQlV*����yد`����̑�%�t<.��S}63ǥ�u�Pf�'��K��m4�517�y�벊��
'�^���f���H�d�����M�ws�u;b�ݡ��^�Z����@�D4\~{�~qg�1f�B�� $�H��̭�+��a�H"F���CԘ�7�}�.��%dq5��R�#A�=�*��S���K���H���#�Ͷ�r%�c�~�Ƅ�Rx��ؙ��L�1�yYхӾA���D�����l�Aj83i�-��0JÙȐ�0!{�@��n�t�Q�0`�V���1��Ħ$�����B����X2La2�̹r���E�&	�C(�!o�\� ��P��_n<��`�O�s�y�Ƨ�[ʦ�M��(�
���íd�7s� 0W���F��y��81��r |2
�72��a���6�]�z�5.qG8`\��&��eq�7�L)����!z3��,��7T�@��B�>��~�?%���a�J�I4HHc�����y!#�!C	����x1%�2�!ϔ�7��D���8�G�!
͍���KS%d<DI���H��u_��(+us��N�u܉dѲ��=E�s�4�¸�+;r��ˌ�|���i�j�嚞O6�tqN�J�����42!~n��Ld�LMټ�e�%;�H!�p��r1�7�8D�A�;�g@`��8�ϣ�i���Ȣ�&ׄ��tg�yx�>����³�թ\>Oi���G�d� ��A�<}s)�̔-�F��,k���Y%�~�(��n�ǁ��Ҹ�Mw��wj��z��Sm�aO�']�S�<z5�~�)���h��Xh�w�f��Wq�,�,��"q�|a"�n3��o�ӽ��K�F���ĭ�����H��7���Rj5�O�'��f�����״�q�R��y�L��_s@ri+�"�%8P��z���Ǜ?W'''�P�<)           x�e�[n�@E�=����t��5UQ@%I���y����1���!C�e��!�di[��6!��A����*a G��c��uYn��P8��sڔ%��uy�>u��>�?�z�/-�_w`�E٘�Q��wH�-��ˊJې�?�⁍Lyq�1\\ �!���a�J��<����Sb+
��N<Y}��F�Λ"e�5���N:�dJ�C��ңl�U��t�H���\u��i��p&@s���I�tM%�������l�Iΐ=1��5�N9���p�|6�@���E)�~��      
      x�3�4�2�4bc 6bS�=... 's�      	   m   x�3�,I-.IL����T1JR14Rq��0/�,��4��		�tOwM7�*5�	.s,7�(sM����2*,I�JJ	���4-���2G��(���D�%��r�p��qqq 1�!�     