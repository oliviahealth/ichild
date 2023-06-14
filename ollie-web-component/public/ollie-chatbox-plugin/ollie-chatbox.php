<?php 
/** 
 * Ollie Chatbox
 *
 * @package     OllieChatbox
 * @author      Tony Qing
 * @copyright   2023 TCAT
 * @license     GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       Ollie Chatbox
 * Plugin URI:        https://example.com/plugins/the-basics/
 * Description:       Ollie chatbox will appear in corner and accept queries to search the website.
 * Version:           0.0.2
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            Tony Qing
 * Author URI:        https://tonyxqing.github.io
 * License:           GPLv2 or later
 * Text Domain:       ollie-chatbox
 * Domain Path:       /languages 
 */


function setup_ollie_chatbox() {
    if ( is_user_logged_in() &&  !is_admin()) {
        wp_enqueue_script('chatbox', plugins_url('chatbox.js', __FILE__));
        wp_localize_script('chatbox', 'my_ajax_obj', array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ));
    }
}

function ollie_chatbox_search_action() {
    global $wpdb;
    $r = $_POST['s'];
    $search_query = $wpdb->prepare("
    SELECT * FROM {$wpdb->posts}
    WHERE (post_type = 'page' OR post_type='post') AND 
    (post_title LIKE '%%%s%%' OR post_content LIKE '%%%s%%') LIMIT 5", $r, $r);
    $results = $wpdb->get_results($search_query);
    $obj = new stdClass();
    $obj->urls = Array();
    $obj->titles = Array();
    foreach ($results as $result) {
        // echo print_r(array_keys(get_object_vars($obj))) . ',';
        array_push($obj->urls, get_permalink($result));
        array_push($obj->titles, $result->post_title);
    }
    echo wp_json_encode($obj);
    wp_die();
}


add_action('wp_head', 'setup_ollie_chatbox');
add_action('wp_ajax_ollie_chatbox_search_action', 'ollie_chatbox_search_action');
