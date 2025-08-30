<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Récupérer les données du formulaire
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);

    // Validation de l'email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "<p>L'adresse email n'est pas valide.</p>";
        exit;
    }

    // Adresse e-mail de destination
    $to = "contact@votresociete.com"; // Remplacez par votre adresse email
    $subject = "Nouveau message de $name";
    $body = "Nom: $name\nEmail: $email\nMessage:\n$message";

    // Adresse e-mail fixe pour l'en-tête From (IMPORTANT : utiliser une adresse de votre domaine)
    $from = "no-reply@votresociete.com"; // Remplacez par une adresse email de votre domaine
    $headers = "From: $from\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Envoyer l'e-mail
    if (mail($to, $subject, $body, $headers)) {
        echo "<p>Merci, $name ! Votre message a été envoyé avec succès.</p>";
        // Redirection vers la page d'accueil
        header("Location: index.html");
        exit;
    } else {
        echo "<p>Désolé, une erreur s'est produite lors de l'envoi de votre message.</p>";
    }
}
?>