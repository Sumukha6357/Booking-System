package com.booking.platform.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class PasswordStrengthValidator implements ConstraintValidator<StrongPassword, String> {

    private static final Pattern UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]");

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isBlank()) {
            return false;
        }
        if (password.length() < 8) {
            return false;
        }
        boolean hasUpper = UPPERCASE.matcher(password).find();
        boolean hasLower = LOWERCASE.matcher(password).find();
        boolean hasDigit = DIGIT.matcher(password).find();
        boolean hasSpecial = SPECIAL.matcher(password).find();
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}