-- add more if needed
CREATE TYPE finance_setting AS ENUM ('trial_days', 'commission_rate', 'ads_price_per_month', 'subscription_price');
create table finance_settings
(
    id         serial primary key,
    key        finance_setting not null,
    value      numeric         not null,
    updated_at timestamptz     not null default now()
);
-- insert initial settings
INSERT INTO finance_settings(key, value)
VALUES ('trial_days', 14);
INSERT INTO finance_settings(key, value)
VALUES ('commission_rate', 15);
INSERT INTO finance_settings(key, value)
VALUES ('ads_price_per_month', 35);
INSERT INTO finance_settings(key, value)
VALUES ('subscription_price', 10);
CREATE TYPE account_role AS ENUM ('employee', 'user', 'pro');

create table accounts
(
    id         serial primary key,
    email      varchar(255) not null unique,
    created_at timestamptz  not null default now(),
    username   varchar(255) not null unique,
    password   varchar(255) not null,
    role       account_role not null,
    deleted_at timestamptz  null,
    is_banned  boolean      not null default false
);
-- create index on role for faster query
CREATE INDEX idx_account_role ON account (role);

-- syntax: [account type]_[entity]_[action/event]
CREATE TYPE noti_setting AS ENUM (
    'user_object_status', -- deposit/listing posted by user is bough/reserved/cancelled reservation by pro
    'user_validation_status', --deposit/posting posted by user is validated by admin
    'user_object_retrieved', -- object in container retrieved by pro
    'user_event_updated', -- my event is updated by admin
    'pro_material_available', --custom alert for new deposit/listing matching chosen material(s)
    'pro_object_deposited', -- object put in container by user
    'pro_subscription_end', -- premium subscription ending in 1 week
    'emp_event_updated', -- my event is updated by admin
    'emp_event_assigned' -- new event assigned to me by admin
    );
create table noti_settings
(
    PRIMARY KEY (id_account, noti_type),
    noti_type  noti_setting not null,
    is_enabled boolean      not null default true,
    id_account integer      not null references account (id) on delete cascade
);

create table users
(
    id_account        integer primary key references account (id) on delete restrict,
    country_code      varchar(3),
    phone             varchar(20),
    up_score          numeric(2) not null default 0,
    completed_onboard boolean   not null default false
    -- TODO: add bank info for payment purposes
);

create table employees
(
    id_account integer primary key references account (id) on delete restrict,
    is_admin   boolean not null default false
);

create table pros
(
    id_account integer primary key references account (id) on delete restrict,
    phone             varchar(20),
    is_premium boolean not null default false
);

CREATE TYPE event_category AS ENUM ('workshop', 'conference', 'conference', 'exposition', 'other');
CREATE TYPE event_status AS ENUM ('pending', 'approved', 'refused', 'cancelled');
create table events
(
    id           serial primary key,
    created_at   timestamptz    not null default now(),
    title        varchar(255)   not null,
    description  text,
    start_at     timestamptz    not null,
    end_at       timestamptz    not null,
    price        numeric(2),                            -- leave null if event is free
    category     event_category not null default 'other',
    capacity     integer,
    status       event_status   not null default 'pending', -- cancelled = deleted
    city         varchar(255)   not null,
    street       varchar(255)   not null,
    location_detail varchar(255),
    created_by   integer references accounts(id) on delete restrict,
);
CREATE INDEX idx_events_status ON events (status);
CREATE INDEX idx_events_category ON events (category);

CREATE TYPE event_registrations_status AS ENUM ('registered', 'cancelled', 'attended');
create table event_registrations
(
    id_account integer references account (id) on delete restrict, -- role of this account can't be employee
    id_event   integer references events (id) on delete restrict,
    PRIMARY KEY (id_event, id_account),
    created_at timestamptz not null       default now(),
    status     event_registrations_status default 'registered',
    paid_price numeric(10,2) not null -- set at registration, prevent price change after registered
);

create table event_employee
(
		assigned_at timestamptz not null       default now(),
    id_employee integer references employees (id_account) on delete restrict,
    id_event    integer references events (id) on delete restrict,
    PRIMARY KEY (id_event, id_employee)
);

-- add more if needed
CREATE TYPE admin_history_entity_type AS ENUM (
    'employee', 'user', 'pro',
    'event', 'container',
    'post', 'comment',
    'listing', 'deposit', 'transaction',
    'subscription', 'finance_setting');
CREATE TYPE action_type AS ENUM ('create', 'update', 'delete');
create table admin_history
(
    id               serial primary key,
    created_at       timestamptz               not null default now(),
    entity_type      admin_history_entity_type not null,
    entity_id        integer                   not null,
    action           action_type               not null,
    old_state        jsonb,
    new_state        jsonb,
    id_employee      integer                   not null references employees (id_account) on delete restrict
);
CREATE INDEX idx_admin_history_employee ON admin_history (id_employee);
CREATE INDEX idx_admin_history_entity ON admin_history (entity_type, entity_id);
CREATE INDEX idx_admin_history_created_at ON admin_history (created_at);

CREATE TYPE post_category AS ENUM ('tutorial', 'project', 'tips', 'news', 'case_study', 'other');
create table posts
(
    id         serial primary key,
    created_at timestamptz   not null default now(),
    title      varchar(255)  not null,
    content    text          not null,
    category   post_category not null default 'other',
    view_count integer       not null default 0,
    like_count integer       not null default 0,
    is_deleted boolean       not null default false,
    id_account integer       not null references account (id) on delete restrict -- this account's role must be pro or employee
);
CREATE INDEX idx_posts_category ON posts (category);
CREATE INDEX idx_posts_created_at ON posts (created_at);

create table comments
(
    id         serial primary key,
    content    text        not null,
    created_at timestamptz not null default now(),
    is_deleted boolean       not null default false,
    like_count integer     not null default 0,
    id_post    integer     not null references posts (id) on delete cascade
    id_account integer     not null references accounts (id) on delete cascade
);

create table saved_posts
(
    id_account integer     not null references account (id) on delete restrict, -- this account's role must be pro or user
    id_post    integer     not null references posts (id) on delete restrict,   -- remember to check is_deleted of post to decide whether to show to user or not
    saved_at   timestamptz not null default now(),
    PRIMARY KEY (id_account, id_post)
);
CREATE TYPE ads_status AS ENUM ('active', 'expired', 'cancelled');
create table ads
(
    id     serial primary key,
    updated_at timestamptz not null default now(),
    start_date date        not null default now(),
    end_date   date        not null,
    status     ads_status  not null default 'active',
    id_post    integer     not null references posts (id) on delete restrict,
    price_per_month numeric(10,2) not null, -- set at purchased to save price at the moment (avoid change in the price afterwards)
    total_price numeric(10,2) not null -- set at purchased to save price at the moment (avoid change in the price afterwards)
);
CREATE INDEX idx_ads_status ON ads (status);

CREATE TYPE photo_object_type AS ENUM ('item', 'post', 'step', 'event', 'avatar');
CREATE TABLE photos (
    id          serial PRIMARY KEY,
    created_at  timestamptz NOT NULL DEFAULT now(),
    is_primary  boolean NOT NULL DEFAULT false,
    path        varchar(255) NOT NULL UNIQUE,
    object_type photo_object_type NOT NULL,
    
    -- Specific FK columns
    item_id     integer REFERENCES items(id) ON DELETE CASCADE,
    post_id     integer REFERENCES posts(id) ON DELETE CASCADE,
    step_id     integer REFERENCES project_steps(id) ON DELETE CASCADE,
    event_id    integer REFERENCES events(id) ON DELETE CASCADE,
    account_id  integer REFERENCES accounts(id) ON DELETE CASCADE, --for avatar

    -- Ensure only one is populated and matches the ENUM
    CONSTRAINT check_single_source CHECK (
        (object_type = 'item'   AND item_id IS NOT NULL    AND post_id IS NULL      AND event_id IS NULL    AND account_id IS NULL) OR
        (object_type = 'post'   AND post_id IS NOT NULL    AND item_id IS NULL      AND event_id IS NULL    AND account_id IS NULL) OR
        (object_type = 'event'  AND event_id IS NOT NULL   AND item_id IS NULL      AND post_id IS NULL     AND account_id IS NULL) OR
        (object_type = 'avatar' AND account_id IS NOT NULL AND item_id IS NULL      AND post_id IS NULL     AND event_id IS NULL)
    );
);

CREATE TYPE item_state AS ENUM ('new', 'very_good', 'good', 'need_repair');
CREATE TYPE material AS ENUM ('wood', 'metal', 'textile', 'glass', 'plastic', 'mixed', 'other');
CREATE TYPE item_status AS ENUM ('pending', 'approved', 'refused', 'completed');
create table items
(
    id          serial primary key,
    created_at  timestamptz  not null default now(),
    title       varchar(255) not null,
    description text,
    price       numeric(2)   not null default 0,
    weight      numeric(2)   not null,                   -- in kg
    material    material     not null default 'other',
    status      item_status  not null default 'pending', -- workflow status
    state       item_state   not null,                   -- new or needs to be repaired
    is_deleted  boolean      not null default false,
    id_user     integer      not null references users(id_account)  on delete restrict
);
CREATE INDEX idx_items_status ON items (status);
CREATE INDEX idx_items_state ON items (state);
CREATE INDEX idx_items_material ON items (material);

create table listings
(
    id_item     integer primary key references items (id) on delete cascade,
    city_name   varchar(255) not null,
    postal_code varchar(10)  not null
);

CREATE TYPE container_status AS ENUM ('ready', 'waiting', 'occupied', 'maintenance');
create table containers
(
    id          serial primary key,
    created_at  timestamptz      not null default now(),
    city_name   varchar(255)     not null,
    postal_code varchar(10)      not null,
    street      text             not null,
    status      container_status not null default 'ready',
    is_deleted  boolean          not null default false
);
CREATE INDEX idx_containers_status ON containers (status);
CREATE INDEX idx_containers_postal_code ON containers (postal_code);

create table deposits
(
    id_item      integer primary key references items (id) on delete cascade,
    id_container integer not null references containers (id) on delete restrict
);

CREATE TYPE barcode_user_type AS ENUM ('user', 'pro');
CREATE TYPE barcode_status AS ENUM ('active', 'expired', 'used');
create table barcodes
(
    PRIMARY KEY (path, code),
    created_at   timestamptz       not null default now(),
    path         varchar(255)      not null,
    code         char(6)           not null,
    valid_from   timestamptz       not null default now(),
    valid_to     timestamptz       not null,
    status       barcode_status    not null default 'active',
    user_type    barcode_user_type not null, -- this code is for user or pro?
    id_account   integer           not null references account (id) on delete cascade,
    id_deposit   integer           not null references deposits (id_item) on delete cascade,
    id_transaction uuid            not null
);

-- sub_from will not change, sub_to will be updated if renew/trial to official
-- is_active: user can cancel subscription before end date (sub_to) and purchase a new subscription (stupid but possible)
create table subscriptions
(
    id        serial primary key,
    is_trial  boolean     not null,
    is_active boolean     not null default true,
    sub_from  timestamptz not null default now(),
    sub_to    timestamptz not null,
    CHECK ( sub_to>sub_from ),
    id_pro    integer     not null references pros (id_account) on delete restrict,
	cancel_reason  text,
    price numeric(10,2) not null -- set at purchased to save price at the moment (avoid change in the price afterwards)
);

create type transaction_action as enum('cancelled', 'purchased', 'expired', 'reserved');
create table transactions(
    id serial primary key ,
    id_transaction uuid not null,
    created_at timestamptz not null default now(),
    action transaction_action not null,
    id_item int not null references items(id) on delete cascade ,
    id_pro int not null references pros(id_account) on delete cascade
    -- expiry time if not paid after reserved
    reservation_expiry       timestamptz, -- set +2 days when reserved   
    item_price  numeric(10,2), -- set at purchased to save item price at the moment (avoid change in the price afterwards)
    commission_rate numeric(5,2), -- set at purchased to save commission rate at the moment (avoid change in the rate afterwards)
    total_price numeric(10,2) -- set at purchased to save total price (item's price + commission) at the moment (avoid change in the rate afterwards)
);
CREATE INDEX idx_transactions_uuid ON transactions(id_transaction);

CREATE TABLE project_steps (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 1
  id_post INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
);

-- a project step can have multiple items
-- an item can be in multiple project steps
CREATE TABLE step_items (
  id_step INTEGER NOT NULL REFERENCES project_steps(id) ON DELETE CASCADE,
  id_item INTEGER NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  PRIMARY KEY (id_step, id_item)
);
