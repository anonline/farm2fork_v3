import { User } from '@supabase/supabase-js';
import { IBillingAddress, IShippingAddress } from './address';
import type { IDateValue, ISocialLink } from './common';

// ----------------------------------------------------------------------

export type IUserTableFilters = {
    name: string;
    role: string[];
    status: string;
    roleTab: string;
};

export type IUserProfileCover = {
    name: string;
    role: string;
    coverUrl: string;
    avatarUrl: string;
};

export type IUserProfile = {
    id: string;
    role: string;
    quote: string;
    email: string;
    school: string;
    country: string;
    company: string;
    totalFollowers: number;
    totalFollowing: number;
    socialLinks: ISocialLink;
};

export type IUserProfileFollower = {
    id: string;
    name: string;
    country: string;
    avatarUrl: string;
};

export type IUserProfileGallery = {
    id: string;
    title: string;
    imageUrl: string;
    postedAt: IDateValue;
};

export type IUserProfileFriend = {
    id: string;
    name: string;
    role: string;
    avatarUrl: string;
};

export type IUserProfilePost = {
    id: string;
    media: string;
    message: string;
    createdAt: IDateValue;
    personLikes: { name: string; avatarUrl: string }[];
    comments: {
        id: string;
        message: string;
        createdAt: IDateValue;
        author: { id: string; name: string; avatarUrl: string };
    }[];
};

export type IUserCard = {
    id: string;
    name: string;
    role: IRole;
    coverUrl: string;
    avatarUrl: string;
    totalPosts: number;
    totalFollowers: number;
    totalFollowing: number;
};

export type IUserItem = {
    id: string;
    name: string;
    city: string; //unused
    role: IRole;
    email: string;
    state: string; //unused
    status: string; //unused
    address: string; //unused
    country: string; //unused
    zip: string; //unused
    company: string; //unused
    avatarUrl: string; //unused
    phone: string; //unused
    isVerified: boolean; //unused
    createdAt: IDateValue;
    supabaseUser: User;
    customerData: ICustomerData | null;
};

export type IUserAccountBillingHistory = {
    id: string;
    price: number;
    invoiceNumber: string;
    createdAt: IDateValue;
};



export type ICustomerData = {
    id: string;
    created_at: Date | string;
    firstname: string;
    lastname: string;
    companyName: string;
    uid: string;
    newsletterConsent: boolean;
    deliveryAddress: IShippingAddress;
    billingAddress: IBillingAddress;
    acquisitionSource: string;
    isCompany: boolean;
    discountPercent: number;
}

export type IRole = {
    uid: string;
    is_admin:boolean;
    is_vip:boolean;
    is_corp:boolean;
}