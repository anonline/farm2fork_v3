<?php

// Load WordPress
require_once('wp-load.php');

global $wpdb;

$result = [];

try {
    // Get users (limited to 20)
    $users = get_users([
        'fields' => 'all',
        'number' => 1500 // Limit to 1500 users
    ]);
    
    foreach ($users as $user) {
        // Get user meta data
        $user_meta = get_user_meta($user->ID);
        
        // Helper function to get meta value
        $get_meta = function($key) use ($user_meta) {
            return isset($user_meta[$key][0]) ? $user_meta[$key][0] : '';
        };
        
        // Parse capabilities/roles
        $roles = [];
        $capabilities = maybe_unserialize($get_meta($wpdb->prefix . 'capabilities'));
        if (is_array($capabilities)) {
            foreach ($capabilities as $role => $has_role) {
                $roles[$role] = (bool)$has_role;
            }
        }
        
        // Parse custom billing addresses (serialized array)
        $billingAddresses = [];
        $custom_billing = $get_meta('custom_billing_addresses');
        if (!empty($custom_billing)) {
            $billing_data = maybe_unserialize($custom_billing);
            if (is_array($billing_data)) {
                foreach ($billing_data as $billing) {
                    $billingAddresses[] = [
                        'first_name' => $billing['first_name'] ?? '',
                        'last_name' => $billing['last_name'] ?? '',
                        'company' => $billing['company'] ?? '',
                        'email' => $billing['email'] ?? $user->user_email,
                        'phone' => $billing['phone'] ?? '',
                        'address_1' => $billing['address_1'] ?? '',
                        'address_2' => $billing['address_2'] ?? '',
                        'city' => $billing['city'] ?? '',
                        'state' => $billing['state'] ?? '',
                        'postcode' => $billing['postcode'] ?? '',
                        'country' => $billing['country'] ?? '',
                        'vat' => $billing['vat'] ?? '',
                        'ring' => $billing['ring'] ?? ''
                    ];
                }
            }
        }
    
        
        // Parse custom shipping addresses (serialized array)
        $shippingAddresses = [];
        $custom_shipping = $get_meta('custom_shipping_addresses');
        if (!empty($custom_shipping)) {
            $shipping_data = maybe_unserialize($custom_shipping);
            if (is_array($shipping_data)) {
                foreach ($shipping_data as $shipping) {
                    $first_name = $shipping['first_name'] ?? '';
                    $last_name = $shipping['last_name'] ?? '';
                    
                    $shippingAddresses[] = [
                        'sid' => uniqid('ship_'),
                        'first_name' => $first_name,
                        'last_name' => $last_name,
                        'fullName' => trim($first_name . ' ' . $last_name),
                        'company' => $shipping['company'] ?? '',
                        'address_1' => $shipping['address_1'] ?? '',
                        'address_2' => $shipping['address_2'] ?? '',
                        'city' => $shipping['city'] ?? '',
                        'postcode' => $shipping['postcode'] ?? '',
                        'country' => $shipping['country'] ?? '',
                        'phone' => $shipping['phone'] ?? '',
                        'note' => $shipping['note'] ?? '',
                        'ring' => $shipping['ring'] ?? '',
                        'action' => 'default'
                    ];
                }
            }
        }
                
        // Build user object
        $userObj = [
            'id' => (int)$user->ID,
            'email' => $user->user_email,
            'password' => $user->user_pass, // WordPress password hash
            'firstname' => $get_meta('first_name'),
            'lastname' => $get_meta('last_name'),
            'company' => $get_meta('billing_company'),
            'from' => $get_meta('honan_hallott'),
        ];
        
        // Add optional fields if they exist
        if (!empty($roles)) {
            $userObj['roles'] = $roles;
        }
        
        if (!empty($billingAddresses)) {
            $userObj['billingaddresses'] = $billingAddresses;
        }
        
        if (!empty($shippingAddresses)) {
            $userObj['shippingaddresses'] = $shippingAddresses;
        }
        
        $mailchimp_id = $get_meta('mailchimp_id');
        $mailchimp_enabled = $get_meta('mailchimp_woocommerce_is_subscribed');
        if (!empty($mailchimp_id) && $mailchimp_enabled === '1') {
            $userObj['mailchimpid'] = $mailchimp_id;
        }

        $invoiceDue = $get_meta('innvoice_payment_due');
        if (!empty($invoiceDue)) {
            $userObj['invoicedue'] = $invoiceDue;
        } else {       
            $userObj['invoicedue'] = 30;
        }

        $userType = $get_meta('billing_type');
        if (!empty($userType)) {
            $userObj['usertype'] = $userType;
        } else {
            $userObj['usertype'] = 'person';
        }
        
        $result[] = $userObj;
    }
    
    // Output JSON
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
} catch (Exception $e) {
    header('Content-Type: application/json; charset=utf-8', true, 500);
    echo json_encode([
        'error' => 'Error: ' . $e->getMessage()
    ]);
}
exit;
