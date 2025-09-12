export type UserType = Record<string, any> | null;

export type AuthState = {
    user: UserType;
    loading: boolean;
    roles? : UserRoles;
};

export type UserRoles = {
    isAdmin: boolean;
    isVip: boolean;
    isCorp: boolean;
    isPublic: boolean;
};

export type AuthContextValue = {
    user: UserType;
    loading: boolean;
    authenticated: boolean;
    unauthenticated: boolean;
    checkUserSession?: () => Promise<void>;
    displayName?: string;
    roles?: UserRoles;
};
